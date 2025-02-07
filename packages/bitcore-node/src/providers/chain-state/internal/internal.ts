import { TransactionJSON } from '../../../types/Transaction';
import through2 from 'through2';
import axios from 'axios';

import { MongoBound } from '../../../models/base';
import { ObjectId } from 'mongodb';
import { CoinStorage, ICoin } from '../../../models/coin';
import { BlockStorage, IBlock } from '../../../models/block';
import { WalletStorage, IWallet } from '../../../models/wallet';
import { WalletAddressStorage, IWalletAddress } from '../../../models/walletAddress';
import { CSP } from '../../../types/namespaces/ChainStateProvider';
import { Storage } from '../../../services/storage';
import { RPC } from '../../../rpc';
import { LoggifyClass } from '../../../decorators/Loggify';
import { TransactionStorage, ITransaction } from '../../../models/transaction';
import { ListTransactionsStream } from './transforms';
import { StringifyJsonStream } from '../../../utils/stringifyJsonStream';
import { StateStorage } from '../../../models/state';
import { SpentHeightIndicators, CoinJSON } from '../../../types/Coin';
import { Config } from '../../../services/config';
import { STATS_URL } from '../../../constants/config';
import nodeCache from '../../../NodeCache';
import { networkMap } from '../../../networkAddressMapping';

@LoggifyClass
export class InternalStateProvider implements CSP.IChainStateService {
  chain: string;
  constructor(chain: string) {
    this.chain = chain;
    this.chain = this.chain.toUpperCase();
  }

  getRPC(chain: string, network: string) {
    const RPC_PEER = Config.get().chains[chain][network].rpc;
    if (!RPC_PEER) {
      throw new Error(`RPC not configured for ${chain} ${network}`);
    }
    const { username, password, host, port } = RPC_PEER;
    return new RPC(username, password, host, port);
  }

  private getAddressQuery(params: CSP.StreamAddressUtxosParams) {
    const { chain, network, address, args } = params;
    if (typeof address !== 'string' || !chain || !network) {
      throw 'Missing required param';
    }
    const query = { chain: chain, network: network.toLowerCase(), address } as any;
    if (args.unspent) {
      query.spentHeight = { $lt: SpentHeightIndicators.minimum };
    }
    return query;
  }

  streamAddressUtxos(params: CSP.StreamAddressUtxosParams) {
    const { req, res, args } = params;
    const { limit } = args;
    const query = this.getAddressQuery(params);
    Storage.apiStreamingFind(CoinStorage, query, { limit }, req, res);
  }

  async streamAddressTransactions(params: CSP.StreamAddressUtxosParams) {
    const { req, res } = params;
    const query = this.getAddressQuery(params);
    Storage.apiStreamingFind(CoinStorage, query, {}, req, res);
  }

  async getBalanceForAddress(params: CSP.GetBalanceForAddressParams) {
    const { chain, network, address } = params;
    const query = {
      chain,
      network,
      address,
      spentHeight: { $lt: SpentHeightIndicators.minimum },
      mintHeight: { $gt: SpentHeightIndicators.conflicting },
    };
    let balance: any = await CoinStorage.getBalance({ query });
    return balance;
  }

  async getRichList(params: CSP.GetRichListParams) {
    const { chain, network, pageNo, pageSize } = params;

    const query = {
      chain,
      network,
      pageNo,
      pageSize,
    };

    const result = await CoinStorage.getRichList({ query });
    return result;
  }

  streamBlocks(params: CSP.StreamBlocksParams) {
    const { req, res } = params;
    const { query, options, anchorsOnly } = this.getBlocksQuery(params);
    // @ts-ignore
    if (!anchorsOnly) {
      Storage.apiStreamingFind(<any>BlockStorage, query, options, req, res);
    } else {
      this.getAnchoredBlock(params);
    }
  }

  async getTotalAnchoredBlocks(params: CSP.GetTotalAnchoredBlocks) {
    const { chain, network } = params;
    const total = await BlockStorage.collection.count({
      chain,
      network,
      processed: true,
      btcTxHash: { $exists: true },
    });
    return { total };
  }

  async getBlocks(params: CSP.GetBlockParams) {
    const { query, options } = this.getBlocksQuery(params);
    let cursor = BlockStorage.collection.find<IBlock>(query, options); //.addCursorFlag('noCursorTimeout', true);
    if (options.sort) {
      cursor = cursor.sort(options.sort);
    }
    let blocks = await cursor.toArray();
    const tip = await this.getLocalTip(params);
    const tipHeight = tip ? tip.height : 0;
    const blockTransform = (b: IBlock) => {
      let confirmations = 0;
      if (b.height && b.height >= 0) {
        confirmations = tipHeight - b.height + 1;
      }
      const convertedBlock = BlockStorage._apiTransform(b, { object: true }) as IBlock;
      return { ...convertedBlock, confirmations };
    };
    return blocks.map(blockTransform);
  }

  getAnchoredBlock(params: CSP.StreamBlocksParams) {
    const { req, res } = params;
    const { query, options } = this.getBlocksQuery(params);
    Storage.apiStreamingFind(<any>BlockStorage, query, options, req, res);
  }

  private getBlocksQuery(params: CSP.GetBlockParams | CSP.StreamBlocksParams) {
    const { chain, network, sinceBlock, blockId, anchorsOnly, args = {} } = params;

    let { startDate, endDate, date, since, direction, paging } = args;
    let { limit = 10, sort = { height: -1 } } = args;
    let options = { limit, sort, since, direction, paging };
    if (!chain || !network) {
      throw 'Missing required param';
    }
    let query: any = {
      chain: chain,
      network: network.toLowerCase(),
      processed: true,
    };
    if (blockId) {
      if (blockId.length === 64) {
        query.hash = blockId;
      } else {
        let height = parseInt(blockId, 10);
        if (Number.isNaN(height) || height.toString(10) !== blockId) {
          throw 'invalid block id provided';
        }
        query.height = height;
      }
    }
    if (sinceBlock) {
      let height = Number(sinceBlock);
      if (Number.isNaN(height) || height.toString(10) !== sinceBlock) {
        throw 'invalid block id provided';
      }
      query.height = { $gt: height };
    }
    if (startDate) {
      query.time = { $gt: new Date(startDate) };
    }
    if (endDate) {
      Object.assign(query.time, { ...query.time, $lt: new Date(endDate) });
    }
    if (date) {
      let firstDate = new Date(date);
      let nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      query.time = { $gt: firstDate, $lt: nextDate };
    }

    if (anchorsOnly) {
      query.btcTxHash = { $exists: true };
    }
    return { query, options, anchorsOnly };
  }

  async getBlock(params: CSP.GetBlockParams) {
    let blocks = await this.getBlocks(params);
    return blocks[0];
  }

  async streamTransactions(params: CSP.StreamTransactionsParams) {
    const { chain, network, req, res, args } = params;
    let { blockHash, blockHeight } = args;
    if (!chain || !network) {
      throw 'Missing chain or network';
    }
    let query: any = {
      chain: chain,
      network: network.toLowerCase(),
    };
    if (blockHeight !== undefined) {
      query.blockHeight = Number(blockHeight);
    }
    if (blockHash !== undefined) {
      query.blockHash = blockHash;
    }
    const tip = await this.getLocalTip(params);
    const tipHeight = tip ? tip.height : 0;
    // @ts-ignore
    return Storage.apiStreamingFind(TransactionStorage, query, args, req, res, (t) => {
      let confirmations = 0;
      if (t.blockHeight !== undefined && t.blockHeight >= 0) {
        confirmations = tipHeight - t.blockHeight + 1;
      }
      const convertedTx = TransactionStorage._apiTransform(t, { object: true }) as Partial<ITransaction>;
      return JSON.stringify({ ...convertedTx, confirmations: confirmations });
    });
  }

  async getTransaction(params: CSP.StreamTransactionParams) {
    let { chain, network, txId } = params;
    if (typeof txId !== 'string' || !chain || !network) {
      throw 'Missing required param';
    }
    network = network.toLowerCase();
    let query = { chain: chain, network, txid: txId };
    const tip = await this.getLocalTip(params);
    const tipHeight = tip ? tip.height : 0;
    const found = await TransactionStorage.collection.findOne(query);
    if (found) {
      let confirmations = 0;
      if (found.blockHeight && found.blockHeight >= 0) {
        confirmations = tipHeight - found.blockHeight + 1;
      }
      const convertedTx = TransactionStorage._apiTransform(found, { object: true }) as TransactionJSON;
      return { ...convertedTx, confirmations: confirmations };
    } else {
      return undefined;
    }
  }

  async getAuthhead(params: CSP.StreamTransactionParams) {
    let { chain, network, txId } = params;
    if (typeof txId !== 'string') {
      throw 'Missing required param';
    }
    const found = (await CoinStorage.resolveAuthhead(txId, chain, network))[0];
    if (found) {
      const transformedCoins = found.identityOutputs.map<CoinJSON>((output) =>
        CoinStorage._apiTransform(output, { object: true })
      );
      return {
        chain: found.chain,
        network: found.network,
        authbase: found.authbase,
        identityOutputs: transformedCoins,
      };
    } else {
      return undefined;
    }
  }

  async createWallet(params: CSP.CreateWalletParams) {
    const { chain, network, name, pubKey, path, singleAddress } = params;
    if (typeof name !== 'string' || !network) {
      throw 'Missing required param';
    }
    const state = await StateStorage.collection.findOne({});
    const initialSyncComplete =
      state && state.initialSyncComplete && state.initialSyncComplete.includes(`${chain}:${network}`);
    const walletConfig = Config.for('api').wallets;
    const canCreate = walletConfig && walletConfig.allowCreationBeforeCompleteSync;
    if (!initialSyncComplete && !canCreate) {
      throw 'Wallet creation not permitted before intitial sync is complete';
    }
    const wallet: IWallet = {
      chain: chain,
      network,
      name,
      pubKey,
      path,
      singleAddress,
    };
    await WalletStorage.collection.insertOne(wallet);
    return wallet;
  }

  async getWallet(params: CSP.GetWalletParams) {
    const { pubKey } = params;
    return WalletStorage.collection.findOne({ pubKey });
  }

  streamWalletAddresses(params: CSP.StreamWalletAddressesParams) {
    let { walletId, req, res } = params;
    let query = { wallet: walletId };
    Storage.apiStreamingFind(WalletAddressStorage, query, {}, req, res);
  }

  async walletCheck(params: CSP.WalletCheckParams) {
    let { chain, network, wallet } = params;
    return new Promise((resolve) => {
      const addressStream = WalletAddressStorage.collection.find({ chain, network, wallet }).project({ address: 1 });
      let sum = 0;
      let lastAddress;
      addressStream.on('data', (walletAddress: IWalletAddress) => {
        if (walletAddress.address) {
          lastAddress = walletAddress.address;
          const addressSum = Buffer.from(walletAddress.address).reduce(
            (tot, cur) => (tot + cur) % Number.MAX_SAFE_INTEGER
          );
          sum = (sum + addressSum) % Number.MAX_SAFE_INTEGER;
        }
      });
      addressStream.on('end', () => {
        resolve({ lastAddress, sum });
      });
    });
  }

  async streamMissingWalletAddresses(params: CSP.StreamWalletMissingAddressesParams) {
    const { chain, network, pubKey, res } = params;
    const wallet = await WalletStorage.collection.findOne({ pubKey });
    const walletId = wallet!._id!;
    const query = { chain, network, wallets: walletId, spentHeight: { $gte: SpentHeightIndicators.minimum } };
    const cursor = CoinStorage.collection.find(query); //.addCursorFlag('noCursorTimeout', true);
    const seen = {};
    const stringifyWallets = (wallets: Array<ObjectId>) => wallets.map((w) => w.toHexString());
    const allMissingAddresses = new Array<string>();
    let totalMissingValue = 0;
    const missingStream = cursor.pipe(
      through2(
        { objectMode: true },
        async (spentCoin: MongoBound<ICoin>, _, done) => {
          if (spentCoin.spentTxid && !seen[spentCoin.spentTxid]) {
            seen[spentCoin.spentTxid] = true;
            // find coins that were spent with my coins
            const spends = await CoinStorage.collection
              .find({ chain, network, spentTxid: spentCoin.spentTxid })
              // .addCursorFlag('noCursorTimeout', true)
              .toArray();
            const missing = spends
              .filter((coin) => !stringifyWallets(coin.wallets).includes(walletId.toHexString()))
              .map((coin) => {
                const { _id, wallets, address, value } = coin;
                totalMissingValue += value;
                allMissingAddresses.push(address);
                return { _id, wallets, address, value, expected: walletId.toHexString() };
              });
            if (missing.length > 0) {
              return done(undefined, { txid: spentCoin.spentTxid, missing });
            }
          }
          return done();
        },
        function (done) {
          this.push({ allMissingAddresses, totalMissingValue });
          done();
        }
      )
    );
    missingStream.pipe(new StringifyJsonStream()).pipe(res);
  }

  async updateWallet(params: CSP.UpdateWalletParams) {
    const { wallet, addresses } = params;
    return WalletAddressStorage.updateCoins({ wallet, addresses });
  }

  async streamWalletTransactions(params: CSP.StreamWalletTransactionsParams) {
    const { chain, network, wallet, res, args } = params;
    const query: any = {
      chain,
      network,
      wallets: wallet._id,
      'wallets.0': { $exists: true },
    };

    if (args) {
      if (args.startBlock || args.endBlock) {
        query.$or = [];
        if (args.includeMempool) {
          query.$or.push({ blockHeight: SpentHeightIndicators.pending });
        }
        let blockRangeQuery = {} as any;
        if (args.startBlock) {
          blockRangeQuery.$gte = Number(args.startBlock);
        }
        if (args.endBlock) {
          blockRangeQuery.$lte = Number(args.endBlock);
        }
        query.$or.push({ blockHeight: blockRangeQuery });
      } else {
        if (args.startDate) {
          const startDate = new Date(args.startDate);
          if (startDate.getTime()) {
            query.blockTimeNormalized = { $gte: new Date(args.startDate) };
          }
        }
        if (args.endDate) {
          const endDate = new Date(args.endDate);
          if (endDate.getTime()) {
            query.blockTimeNormalized = query.blockTimeNormalized || {};
            query.blockTimeNormalized.$lt = new Date(args.endDate);
          }
        }
      }
    }

    const transactionStream = TransactionStorage.collection.find(query).sort({ blockTimeNormalized: 1 });
    // .addCursorFlag('noCursorTimeout', true);
    const listTransactionsStream = new ListTransactionsStream(wallet);
    transactionStream.pipe(listTransactionsStream).pipe(res);
  }

  async getWalletBalance(params: CSP.GetWalletBalanceParams): Promise<{ confirmed: number; unconfirmed: number; balance: number }> {
    const query = {
      wallets: params.wallet._id,
      'wallets.0': { $exists: true },
      spentHeight: { $lt: SpentHeightIndicators.minimum },
      mintHeight: { $gt: SpentHeightIndicators.conflicting },
    };
    return <{ confirmed: number; unconfirmed: number; balance: number }>await CoinStorage.getBalance({ query });
  }

  async getWalletBalanceAtTime(params: CSP.GetWalletBalanceAtTimeParams) {
    const { chain, network, time } = params;
    let query = { wallets: params.wallet._id, 'wallets.0': { $exists: true } };
    return <{ confirmed: number; unconfirmed: number; balance: number }>await CoinStorage.getBalanceAtTime({ query, time, chain, network });
  }

  async streamWalletUtxos(params: CSP.StreamWalletUtxosParams) {
    const { wallet, limit, args = {}, req, res } = params;
    let query: any = {
      wallets: wallet._id,
      'wallets.0': { $exists: true },
      mintHeight: { $gt: SpentHeightIndicators.conflicting },
    };
    if (args.includeSpent !== 'true') {
      query.spentHeight = { $lt: SpentHeightIndicators.pending };
    }
    const tip = await this.getLocalTip(params);
    const tipHeight = tip ? tip.height : 0;
    const utxoTransform = (c: ICoin): string => {
      let confirmations = 0;
      if (c.mintHeight && c.mintHeight >= 0) {
        confirmations = tipHeight - c.mintHeight + 1;
      }
      c.confirmations = confirmations;
      return CoinStorage._apiTransform(c) as string;
    };

    Storage.apiStreamingFind(CoinStorage, query, { limit }, req, res, utxoTransform);
  }

  async getFee(params: CSP.GetEstimateSmartFeeParams) {
    const { chain, network, target } = params;
    return this.getRPC(chain, network).getEstimateSmartFee(Number(target));
  }

  async broadcastTransaction(params: CSP.BroadcastTransactionParams) {
    const { chain, network, rawTx } = params;
    return new Promise((resolve, reject) => {
      this.getRPC(chain, network).sendTransaction(rawTx, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  async getCoinsForTx({ chain, network, txid }: { chain: string; network: string; txid: string }) {
    const tx = await TransactionStorage.collection.countDocuments({ txid });
    if (tx === 0) {
      throw new Error(`No such transaction ${txid}`);
    }

    let inputs = await CoinStorage.collection
      .find({
        chain,
        network,
        spentTxid: txid,
      })
      // .addCursorFlag('noCursorTimeout', true)
      .toArray();

    const outputs = await CoinStorage.collection
      .find({
        chain,
        network,
        mintTxid: txid,
      })
      // .addCursorFlag('noCursorTimeout', true)
      .toArray();

    return {
      inputs: inputs.map((input) => CoinStorage._apiTransform(input, { object: true })),
      outputs: outputs.map((output) => CoinStorage._apiTransform(output, { object: true })),
    };
  }

  async getLatestTransactions(params: CSP.GetLatestTransactionsParams) {
    const { chain, network } = params;
    const query = {
      chain,
      network,
    };

    const result = await TransactionStorage.getLatestTransactions({ query });
    return result;
  }

  async getDailyTransactions({ chain, network }: { chain: string; network: string }) {
    const beforeBitcoin = new Date('2009-01-09T00:00:00.000Z');
    const todayTruncatedUTC = new Date(new Date().toISOString().split('T')[0]);
    const results = await BlockStorage.collection
      .aggregate<{
        date: string;
        transactionCount: number;
      }>([
        {
          $match: {
            chain,
            network,
            timeNormalized: {
              $gte: beforeBitcoin,
              $lt: todayTruncatedUTC,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timeNormalized',
              },
            },
            transactionCount: {
              $sum: '$transactionCount',
            },
          },
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            transactionCount: '$transactionCount',
          },
        },
        {
          $sort: {
            date: 1,
          },
        },
      ])
      .toArray();
    return {
      chain,
      network,
      results,
    };
  }

  async getStats(params: CSP.GetStatsParams) {
    const { network } = params;

    const result = await axios({
      method: 'get',
      url: `${STATS_URL}?network=${network}`,
    });
    return result.data;
  }

  async getCoinCalculation(params: CSP.GetCoinCalculation) {
    const { chain, network } = params;
    const cacheName = ``;
    const CACHE_TTL_SECONDS = 60;
    const cache = nodeCache.get(cacheName);

    if (!cache) {
      const result = await CoinStorage.collection
        .aggregate([
          {
            $match: {
              chain: chain,
              network: network,
              address: { $ne: 'false' },
              spentHeight: { $lt: SpentHeightIndicators.minimum },
              mintHeight: { $gt: SpentHeightIndicators.conflicting },
            },
          },
          { $group: { _id: null, total: { $sum: '$value' } } },
        ])
        .toArray();
      const resp = result[0] || { total: 0 };
      nodeCache.set(cacheName, resp, CACHE_TTL_SECONDS);
      return resp;
    }
    return cache;
  }

  async getLocalTip({ chain, network }) {
    if (BlockStorage.chainTips[chain] && BlockStorage.chainTips[chain][network]) {
      return BlockStorage.chainTips[chain][network];
    } else {
      return BlockStorage.getLocalTip({ chain, network });
    }
  }

  async getLocatorHashes(params) {
    const { chain, network, startHeight, endHeight } = params;
    const query =
      startHeight && endHeight
        ? {
          processed: true,
          chain,
          network,
          height: { $gt: startHeight, $lt: endHeight },
        }
        : {
          processed: true,
          chain,
          network,
        };
    const locatorBlocks = await BlockStorage.collection
      .find(query, { sort: { height: -1 }, limit: 30 })
      // .addCursorFlag('noCursorTimeout', true)
      .toArray();
    if (locatorBlocks.length < 2) {
      return [Array(65).join('0')];
    }
    return locatorBlocks.map((block) => block.hash);
  }

  getAccount(params: any): Promise<any> {
    return Promise.resolve({});
  }
  async getDecodeRawTx(params: CSP.StreamTransactionParams) {
    const { chain, network, txId } = params;
    const rawTx = await this.getRPC(chain, network).getRawTx(txId);
    return await this.getRPC(chain, network).decodeRawTx(rawTx);
  }

  async getDecode(params) {
    const { chain, network, rawTx } = params;
    return await this.getRPC(chain, network).decodeRawTx(rawTx);
  }

  async sendtoaddress(params): Promise<JSON> {
    try {
      const { chain, network, address, amount } = params;
      return await this.getRPC(chain, network).sendtoaddress(address, amount);
    }
    catch {
      return <any>null;
    }
  }

  async listmasternodes(params) {
    const { chain, network, start, includingStart, limit } = params;
    return await this.getRPC(chain, network).listmasternodes(start, includingStart, limit);
  }

  async listallmasternodes(params) {
    const { chain, network } = params;
    return await this.getRPC(chain, network).listallmasternodes();
  }

  async icxListOrders(params: any): Promise<any> {
    const { chain, network, token, chainId: chainId, orderTx, limit, closed } = params;

    return await this.getRPC(chain, network).icxListOrders(token, chainId, orderTx, limit, closed);
  }
  async icxGetOrder(params: any): Promise<any> {
    const { chain, network, orderTx } = params;

    return await this.getRPC(chain, network).icxGetOrder(orderTx);

  }
  async icxListHtlcs(params: any): Promise<any> {
    const { chain, network, offerTx, limit, closed } = params;
    return await this.getRPC(chain, network).icxListHtlcs(offerTx, limit, closed);

  }


}
