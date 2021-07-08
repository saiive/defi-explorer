import request = require('request');
import { LoggifyClass } from './decorators/Loggify';
type CallbackType = (err: any, data?: any) => any;

@LoggifyClass
export class RPC {
  constructor(private username: string, private password: string, private host: string, private port: number) { }

  public callMethod(method: string, params: any, callback: CallbackType) {
    request(
      {
        method: 'POST',
        url: `http://${this.username}:${this.password}@${this.host}:${this.port}`,
        body: {
          jsonrpc: '1.0',
          id: Date.now(),
          method: method,
          params: params,
        },
        json: true,
      },
      (err, res) => {
        if (err) {
          return callback(err);
        } else if (res) {
          if (res.body) {
            if (res.body.error) {
              return callback(res.body.error);
            } else if (res.body.result !== undefined) {
              return callback(null, res.body && res.body.result);
            } else {
              return callback({ msg: 'No error or body found', body: res.body });
            }
          }
        } else {
          return callback('No response or error returned by rpc call');
        }
      }
    );
  }

  async asyncCall<T = any>(method: string, params: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      this.callMethod(method, params, (err, data) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log(err.message);
          return reject(err);
        }
        return resolve(data);
      });
    });
  }

  getChainTip(callback: CallbackType) {
    this.callMethod('getchaintips', [], (err, result) => {
      if (err) {
        return callback(err);
      }
      return callback(null, result[0]);
    });
  }

  getBestBlockHash(callback: CallbackType) {
    this.callMethod('getbestblockhash', [], callback);
  }

  getBlockHeight(callback: CallbackType) {
    this.callMethod('getblockcount', [], callback);
  }

  getBlock(hash: string, verbose: boolean, callback: CallbackType) {
    this.callMethod('getblock', [hash, verbose], callback);
  }

  getBlockHash(height: number, callback: CallbackType) {
    this.callMethod('getblockhash', [height], callback);
  }

  getBlockByHeight(height: number, callback: CallbackType) {
    this.getBlockHash(height, (err, hash) => {
      if (err) {
        return callback(err);
      }
      this.getBlock(hash, false, callback);
    });
  }

  getTransaction(txid: string, callback: CallbackType) {
    this.callMethod('getrawtransaction', [txid, true], (err, result) => {
      if (err) {
        return callback(err);
      }
      return callback(null, result);
    });
  }

  sendTransaction(rawTx: string, callback: CallbackType) {
    this.callMethod('sendrawtransaction', [rawTx], callback);
  }

  decodeScript(hex: string, callback: CallbackType) {
    this.callMethod('decodescript', [hex], callback);
  }

  getWalletAddresses(account: string, callback: CallbackType) {
    this.callMethod('getaddressesbyaccount', [account], callback);
  }

  async getEstimateSmartFee(target: number) {
    return this.asyncCall('estimatesmartfee', [target]);
  }

  async getEstimateFee(target: number) {
    return this.asyncCall('estimatefee', [target]);
  }

  async getCustomTxApplied(txid: string, blockHeight: number) {
    return this.asyncCall('isappliedcustomtx', [txid, blockHeight]);
  }

  async getToken(token: any): Promise<any> {
    return this.asyncCall('gettoken', [token]);
  }

  async getAccount(ownerAddress: string): Promise<any> {
    return this.asyncCall('getaccount', [ownerAddress]);
  }

  async listTokens(): Promise<any> {
    return this.asyncCall('listtokens', []);
  }  
  
  async listPrices(): Promise<any> {
    return this.asyncCall('listprices', []);
  }  
  
  async listOracles(): Promise<any> {
    return this.asyncCall('listOracles', []);
  } 
  
  async getOracleData(oracleId: string): Promise<any> {
    return this.asyncCall('getoracledata ', [oracleId]);
  }

  async getGov(): Promise<any> {
    return this.asyncCall('getgov', ['LP_DAILY_DFI_REWARD']);
  }

  async listPoolPairs(): Promise<any> {
    return this.asyncCall('listpoolpairs', []);
  }

  async listPoolShares(start: number, including_start: boolean, limit: number): Promise<any> {
    return this.asyncCall('listpoolshares', [{ start, including_start, limit }, true, false]);
  }
  async getPoolPair(poolID: string): Promise<any> {
    return this.asyncCall('getpoolpair', [poolID]);
  }

  async testPoolSwap(from: string, tokenFrom: string, amountForm: number, to: string, tokenTo: string, maxPrice: number): Promise<any> {
    return this.asyncCall('testpoolswap', [{ 'from': from, 'tokenFrom': tokenFrom, 'amountFrom': amountForm, 'to': to, 'tokenTo': tokenTo }]);
  }

  async listAccountHistory(owner: string, token: string, limit: number, maxBlockHeight: number, noRewards: boolean): Promise<any> {
    let query = {
      token: token
    };

    if (limit) {
      query['limit'] = limit;
    }

    if (maxBlockHeight) {
      query['maxBlockHeight'] = maxBlockHeight;
    }

    query['no_rewards'] = noRewards;

    return this.asyncCall('listaccounthistory', [owner, query]);
  }

  async getRawTx(txId: string): Promise<string> {
    return this.asyncCall<string>('getrawtransaction', [txId]);
  }

  async decodeRawTx(hex: string): Promise<JSON> {
    return this.asyncCall<JSON>('decoderawtransaction', [hex]);
  }

  async sendtoaddress(address: string, value: string | number) : Promise<JSON> {
    return this.asyncCall<JSON>('sendtoaddress', [address, value]);
  }

  listallmasternodes() : Promise<JSON> {
    return this.asyncCall<JSON>('listmasternodes', []);
  }
  listmasternodes(start: string, includingStart: boolean, limit: number) : Promise<JSON> {
    return this.asyncCall<JSON>('listmasternodes', [{ start, including_start: includingStart, limit }]);
  }

  async getAnchoredBlock(
    minBtcHeight?: number,
    maxBtcHeight?: number,
    minConfs?: number,
    maxConfs?: number
  ): Promise<any> {
    return this.asyncCall('spv_listanchors', [minBtcHeight, maxBtcHeight, minConfs, maxConfs]);
  }
}

@LoggifyClass
export class AsyncRPC {
  private rpc: RPC;

  constructor(username: string, password: string, host: string, port: number) {
    this.rpc = new RPC(username, password, host, port);
  }

  async call<T = any>(method: string, params: any[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.rpc.callMethod(method, params, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }

  async block(hash: string): Promise<RPCBlock<string>> {
    return (await this.call('getblock', [hash, 1])) as RPCBlock<string>;
  }

  async verbose_block(hash: string): Promise<RPCBlock<RPCTransaction>> {
    return (await this.call('getblock', [hash, 2])) as RPCBlock<RPCTransaction>;
  }

  async generate(n: number): Promise<string[]> {
    return (await this.call('generate', [n])) as string[];
  }

  async getnewaddress(account: string): Promise<string> {
    return (await this.call('getnewaddress', [account])) as string;
  }

  async transaction(txid: string, block?: string): Promise<RPCTransaction> {
    const args = [txid, true];
    if (block) {
      args.push(block);
    }
    return (await this.call('getrawtransaction', args)) as RPCTransaction;
  }

  async sendtoaddress(address: string, value: string | number) {
    return this.call<string>('sendtoaddress', [address, value]);
  }
}

export type RPCBlock<T> = {
  hash: string;
  confirmations: number;
  size: number;
  strippedsize: number;
  weight: number;
  height: number;
  version: number;
  versionHex: string;
  merkleroot: string;
  tx: T[];
  time: number;
  mediantime: number;
  nonce: number;
  bits: string;
  difficulty: number;
  chainwork: string;
  previousblockhash: string;
  nextblockhash: string;
};

export type RPCTransaction = {
  in_active_chain: boolean;
  hex: string;
  txid: string;
  hash: string;
  strippedsize: number;
  size: number;
  vsize: number;
  version: number;
  locktime: number;
  vin: {
    txid: string;
    vout: number;
    scriptSig: {
      asm: string;
      hex: string;
    };
    sequence: number;
    txinwitness: string[];
  }[];
  vout: {
    value: number;
    n: number;
    scriptPubKey: {
      asm: string;
      hex: string;
      reqSigs: number;
      type: string;
      addresses: string[];
    };
  }[];
  blockhash: string;
  confirmations: number;
  time: number;
  blocktime: number;
};
