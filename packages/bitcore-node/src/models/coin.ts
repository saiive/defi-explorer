var bitcore = require('bitcore-lib-dfi');

import { LoggifyClass } from '../decorators/Loggify';
import { BaseModel, MongoBound } from './base';
import { ObjectID, CollectionAggregationOptions } from 'mongodb';
import { SpentHeightIndicators, CoinJSON } from '../types/Coin';
import { valueOrDefault } from '../utils/check';
import { StorageService } from '../services/storage';
import { BlockStorage } from './block';
import { RICH_LIST_PAGE_SIZE } from '../constants/config';
import nodeCache from '../NodeCache';

export type ICoin = {
  network: string;
  chain: string;
  mintTxid: string;
  mintIndex: number;
  mintHeight: number;
  coinbase: boolean;
  value: number;
  address: string;
  script: Buffer;
  wallets: Array<ObjectID>;
  spentTxid?: string;
  spentHeight: number;
  confirmations?: number;
};

@LoggifyClass
export class CoinModel extends BaseModel<ICoin> {
  constructor(storage?: StorageService) {
    super('coins', storage);
  }

  allowedPaging = [
    { key: 'mintHeight' as 'mintHeight', type: 'number' as 'number' },
    { key: 'spentHeight' as 'spentHeight', type: 'number' as 'number' },
  ];

  onConnect() {
    this.collection.createIndex({ mintTxid: 1, mintIndex: 1 }, { background: true });
    this.collection.createIndex(
      { address: 1, chain: 1, network: 1 },
      {
        background: true,
        partialFilterExpression: {
          spentHeight: { $lt: 0 },
        },
      }
    );
    this.collection.createIndex({ address: 1 }, { background: true });
    this.collection.createIndex({ chain: 1, network: 1, mintHeight: 1 }, { background: true });
    this.collection.createIndex({ spentTxid: 1 }, { background: true, sparse: true });
    this.collection.createIndex({ chain: 1, network: 1, spentHeight: 1 }, { background: true });
    this.collection.createIndex(
      { wallets: 1, spentHeight: 1, value: 1, mintHeight: 1 },
      { background: true, partialFilterExpression: { 'wallets.0': { $exists: true } } }
    );
    this.collection.createIndex(
      { wallets: 1, spentTxid: 1 },
      { background: true, partialFilterExpression: { 'wallets.0': { $exists: true } } }
    );
    this.collection.createIndex(
      { wallets: 1, mintTxid: 1 },
      { background: true, partialFilterExpression: { 'wallets.0': { $exists: true } } }
    );
  }

  async insertGenesisCoins(coin: ICoin, address: string, mintTxid: string) {
    const count = await this.collection.find({ address, mintTxid }).count();
    if (count === 0) {
      await this.collection.insert(coin);
    }
  }

  async getRichList(
    params: { query: any },
    options: CollectionAggregationOptions = {
      allowDiskUse: true,
      cursor: { batchSize: 100 },
    }
  ) {
    const { pageNo } = params.query;
    const pageSize =
      !params.query.pageSize || params.query.pageSize === NaN ? RICH_LIST_PAGE_SIZE : params.query.pageSize;
    const cacheKey = `${pageNo}-${pageSize}`;
    const cache = nodeCache.get(cacheKey);
    const CACHE_TTL_SECONDS = 300;

    const baseCodition = [
      {
        $match: {
          address: { $ne: 'false' },
          spentHeight: { $lt: SpentHeightIndicators.minimum },
          mintHeight: { $gt: SpentHeightIndicators.conflicting },
        },
      },
      { $group: { _id: '$address', balance: { $sum: '$value' } } },
      {
        $project: {
          _id: 0,
          address: '$_id',
          balance: 1,
        },
      },
      { $sort: { balance: -1 } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          data: {
            $push: {
              address: '$address',
              balance: '$balance',
            },
          },
        },
      },
      {
        $project: {
          total: 1,
          data: {
            $slice: ['$data', pageSize * (pageNo - 1), pageSize],
          },
        },
      },
    ];

    // Have time stamp within the last 300 seconds, skip fetching again.
    if (!cache) {
      const result: any = await this.collection
        .aggregate(baseCodition, options)
        // @ts-ignore
        // .addCursorFlag('noCursorTimeout', true)
        .toArray();

      // add data to cache
      const resp = result[0] || {};
      nodeCache.set(cacheKey, resp, CACHE_TTL_SECONDS);
      return resp;
    }

    return cache;
  }

  async getTransactionIdsForAddress(params: { query: any }) {
    const { address } = params.query;
    const result = await this.collection.distinct('mintTxid', { address });
    return result;
  }

  async getBalance(params: { query: any }, options: CollectionAggregationOptions = {}) {
    let { query } = params;
    const CACHE_TTL_SECONDS = 60;
    const cacheName = `${query.address}-balance`;
    const cache = nodeCache.get(cacheName);

    if (!cache) {
      const result = await this.collection
        .aggregate<{ _id: string; balance: number }>(
          [
            { $match: query },
            {
              $project: {
                value: 1,
                status: {
                  $cond: {
                    if: { $gte: ['$mintHeight', SpentHeightIndicators.minimum] },
                    then: 'confirmed',
                    else: 'unconfirmed',
                  },
                },
                _id: 0,
              },
            },
            {
              $group: {
                _id: '$status',
                balance: { $sum: '$value' },
              },
            },
          ],
          options
        )
        .toArray();
      const response = result.reduce<{ confirmed: number; unconfirmed: number; balance: number }>(
        (acc, cur) => {
          acc[cur._id] = cur.balance;
          acc.balance += cur.balance;
          return acc;
        },
        { confirmed: 0, unconfirmed: 0, balance: 0 }
      );
      nodeCache.set(cacheName, response, CACHE_TTL_SECONDS);
      return response;
    }
    return cache;
  }

  async getBalanceAtTime(params: { query: any; time: string; chain: string; network: string }) {
    let { query, time, chain, network } = params;
    const [block] = await BlockStorage.collection
      .find({
        $query: {
          chain,
          network,
          timeNormalized: { $lte: new Date(time) },
        },
      })
      .limit(1)
      .sort({ timeNormalized: -1 })
      .toArray();
    const blockHeight = block!.height;
    const combinedQuery = Object.assign(
      {},
      {
        $or: [{ spentHeight: { $gt: blockHeight } }, { spentHeight: SpentHeightIndicators.unspent }],
        mintHeight: { $lte: blockHeight },
      },
      query
    );
    return this.getBalance({ query: combinedQuery }, { hint: { wallets: 1, spentHeight: 1, value: 1, mintHeight: 1 } });
  }

  resolveAuthhead(mintTxid: string, chain?: string, network?: string) {
    return this.collection
      .aggregate<{
        chain: string;
        network: string;
        authbase: string;
        identityOutputs: ICoin[];
      }>([
        {
          $match: {
            mintTxid: mintTxid.toLowerCase(),
            mintIndex: 0,
            ...(typeof chain === 'string' ? { chain } : {}),
            ...(typeof network === 'string' ? { network } : {}),
          },
        },
        {
          $graphLookup: {
            from: 'coins',
            startWith: '$spentTxid',
            connectFromField: 'spentTxid',
            connectToField: 'mintTxid',
            as: 'authheads',
            maxDepth: 1000000,
            restrictSearchWithMatch: {
              mintIndex: 0,
            },
          },
        },
        {
          $project: {
            chain: '$chain',
            network: '$network',
            authbase: '$mintTxid',
            identityOutputs: {
              $filter: {
                input: '$authheads',
                as: 'authhead',
                cond: {
                  $and: [
                    {
                      $lte: ['$$authhead.spentHeight', -1],
                    },
                    {
                      $eq: ['$$authhead.chain', '$chain'],
                    },
                    {
                      $eq: ['$$authhead.network', '$network'],
                    },
                  ],
                },
              },
            },
          },
        },
      ])
      .toArray();
  }

  getCustomTxOut(coin: MongoBound<ICoin>): any {
    var script = new bitcore.Script(coin.script.toString('hex'));
    if (script.isDataOut()) {
      const reader = new bitcore.encoding.BufferReader(script.getData());
      reader.pos = 3;

      reader.read(1).toString('utf8');

      const typeRaw = reader.read(1).toString('utf8');
      const type = typeRaw.replace('', '');

      if (type === 'T') {
        const size = reader.readUInt8();

        const symbol = reader.read(size).toString('utf8');

        const size2 = reader.readUInt8();
        const name = reader.read(size2).toString('utf8');

        const decimal = reader.readUInt8();

        const limit = reader.readUInt64BEBN();

        const flags = reader.readUInt8();

        return {
          type,
          symbol,
          name,
          decimal,
          limit,
          flags,
        };
      }
      return {
        type,
      };
    }
    return null;
  }

  _apiTransform(coin: MongoBound<ICoin>, options?: { object: boolean }): any {
    const transform: CoinJSON = {
      _id: valueOrDefault(coin._id, new ObjectID()).toHexString(),
      chain: valueOrDefault(coin.chain, ''),
      network: valueOrDefault(coin.network, ''),
      coinbase: valueOrDefault(coin.coinbase, false),
      mintIndex: valueOrDefault(coin.mintIndex, -1),
      spentTxid: valueOrDefault(coin.spentTxid, ''),
      mintTxid: valueOrDefault(coin.mintTxid, ''),
      mintHeight: valueOrDefault(coin.mintHeight, -1),
      spentHeight: valueOrDefault(coin.spentHeight, SpentHeightIndicators.error),
      address: valueOrDefault(coin.address, ''),
      script: valueOrDefault(coin.script, Buffer.alloc(0)).toString('hex'),
      value: valueOrDefault(coin.value, -1),
      confirmations: valueOrDefault(coin.confirmations, -1),
      customTxOut: valueOrDefault(CoinStorage.getCustomTxOut(coin), null),
    };
    if (options && options.object) {
      return transform;
    }
    return JSON.stringify(transform);
  }
}
export let CoinStorage = new CoinModel();
