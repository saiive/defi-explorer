import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiProvider } from '../../providers/api/api';
import { CurrencyProvider } from '../../providers/currency/currency';
import { BlocksProvider } from '../blocks/blocks';

interface CoinsApiResponse {
  inputs: ApiCoin[];
  outputs: ApiCoin[];
}

export type CustomTxCreateMasternode = {
  operatorType: number,
  operatorAuthAddress: string,
}

export type CustomTxResignMasternode = {
  nodeId: string;
}

export type CustomTxCreateToken = {
  symbol: string;
  name: string;
  decimal: number;
  limit: number;
  flags: number;
}

export type CustomTxMintToken = {
  minted: Map<any, any>;
}

export type CustomTxUpdateToken = {
  tokenTx: string;
  isDAT: number;
}

export type CustomTxUpdateTokenAny = {
  tokenTx: string;
  newToken: {
    symbol: string;
    name: string;
    decimal: number;
    limit: number;
    mintable: number;
    tradeable: number;
    isDAT: number;
  };
}

export type CustomTxCreatePoolPair = {
  idTokenA: string;
  idTokenB: string;
  commission: number;
  ownerAddress: string;
  status: string;
  pairSymbol: string;
}

export type CustomTxUpdatePoolPair = {
  pollId: string;
  status: string;
  commission: number;
  ownerAddress: string;
}

export type CustomTxPoolSwap = {
  from: string;
  to: string;
  idTokenFrom: string;
  idTokenTo: string;
  amountFrom: number;
  maxPrice: {
    integer: number;
    fraction: number;
  }
}

export type CustomTxAddPoolLiquidity = {
  from: Map<any, any>;
  shareAddress: string;
}

export type CustomTxRemovePoolLiquidity = {
  from: string;
  shareAddress: string;
  nValue: number;
}

export type CustomTxSetGovVariable = {
  name: string;
}

export type CustomTxUtxosToAccount = {
  to: Map<any, any>;
}

export type CustomTxAccountToUtxos = {
  from: string;
  balances: Map<any, any>;
  mintingOutputsStart: string;
}

export type CustomTxAccountToAccount = {
  from: string;
  to: Map<any, any>;
}

interface CustomTx {
  isCustom: boolean;
  txType: 'C' | 'R' | 'T' | 'M' | 'N' | 'n' | 'p' | 'u' | 's' | 'l' | 'r' | 'U' | 'b' | 'B' | 'G' | null;
  customData: CustomTxCreateMasternode |
    CustomTxResignMasternode |
    CustomTxCreateToken |
    CustomTxMintToken |
    CustomTxUpdateToken |
    CustomTxUpdateTokenAny |
    CustomTxCreatePoolPair |
    CustomTxUpdatePoolPair |
    CustomTxPoolSwap |
    CustomTxAddPoolLiquidity |
    CustomTxRemovePoolLiquidity |
    CustomTxSetGovVariable |
    CustomTxUtxosToAccount |
    CustomTxAccountToUtxos |
    CustomTxAccountToAccount | null;
}

export interface ApiTx extends CustomTx {
  address: string;
  chain: string;
  network: string;
  txid: string;
  blockHeight: number;
  blockHash: string;
  blockTime: Date;
  blockTimeNormalized: Date;
  coinbase: boolean;
  size: number;
  confirmations: number;
  locktime: number;
  inputs: ApiCoin[];
  outputs: ApiCoin[];
  mintTxid: string;
  mintHeight: number;
  spentTxid: string;
  spentHeight: number;
  value: number;
  version: number;
  isCustomTxApplied: boolean;
}

export interface ApiCoin {
  txid: string;
  mintTxid: string;
  coinbase: boolean;
  vout: number;
  address: string;
  script: {
    asm: string;
    type: string;
  };
  spentTxid: string;
  mintHeight: number;
  spentHeight: number;
  value: number;
  customTxOut: any;
}

export interface AppCoin {
  txid: string;
  valueOut: number;
  value: number;
  spentTxid: string;
  mintTxid: string;
  mintHeight: number;
  spentHeight: number;
}

export interface AppInput {
  coinbase: boolean;
  sequence: number;
  n: number;
  txid: string;
  vout: number;
  scriptSig: {
    hex: string;
    asm: string;
    addresses: string[];
    type: string;
  };
  addr: string;
  valueSat: number;
  value: number;
  doubleSpentTxID: string;
  isConfirmed: boolean;
  confirmations: number;
  unconfirmedInput: string;
}

export interface AppOutput {
  value: number;
  n: number;
  scriptPubKey: {
    hex: string;
    asm: string;
    addresses: string[];
    type: string;
  };
  spentTxId: null;
  spentIndex: null;
  spentHeight: null;
}

export interface AppTx extends CustomTx {
  txid: string;
  blockhash: string;
  version: number;
  locktime: number;
  isCoinBase: boolean;
  vin: any[];
  vout: any[];
  confirmations: number;
  time: number;
  valueOut: number;
  size: number;
  fee: number;
  blockheight: number;
  blocktime: number;
  isCustomTxApplied: boolean;
  chain: string;
}

@Injectable()
export class TxsProvider {
  constructor(
    public httpClient: HttpClient,
    public currency: CurrencyProvider,
    public blocksProvider: BlocksProvider,
    private api: ApiProvider
  ) { }

  public getFee(tx: AppTx): number {
    const sumSatoshis: any = (arr: any): number =>
      arr.reduce((prev, cur) => prev + cur.value, 0);
    const inputs: number = sumSatoshis(tx.vin);
    const outputs: number = sumSatoshis(tx.vout);
    const fee: number = tx.isCoinBase ? 0 : inputs - outputs;
    return fee;
  }

  public toAppTx(tx: ApiTx): AppTx {
    return {
      txid: tx.txid,
      fee: null, // calculated later, when coins are retrieved
      blockheight: tx.blockHeight,
      confirmations: tx.confirmations,
      blockhash: tx.blockHash,
      blocktime: new Date(tx.blockTime).getTime() / 1000,
      time: new Date(tx.blockTime).getTime() / 1000,
      isCoinBase: tx.coinbase,
      size: tx.size,
      locktime: tx.locktime,
      vin: [], // populated when coins are retrieved
      vout: [], // populated when coins are retrieved
      valueOut: tx.value,
      version: tx.version,
      isCustom: tx.isCustom || false,
      txType: tx.txType || null,
      customData: tx.customData || null,
      isCustomTxApplied: tx.isCustomTxApplied || false,
      chain: tx.chain,
    };
  }

  public toAppCoin(coin: ApiCoin): AppCoin {
    return {
      txid: coin.txid,
      mintTxid: coin.mintTxid,
      mintHeight: coin.mintHeight,
      spentHeight: coin.spentHeight,
      valueOut: coin.value,
      value: coin.value,
      spentTxid: coin.spentTxid
    };
  }

  public getTxs(args?: { blockHash?: string }): Observable<ApiTx[]> {
    let queryString = '';
    if (args.blockHash) {
      queryString += `?blockHash=${args.blockHash}`;
    }
    const url: string = this.api.getUrl() + '/tx' + queryString;
    return this.httpClient.get<ApiTx[]>(url);
  }

  public getTx(hash: string): Observable<ApiTx> {
    const url: string = this.api.getUrl() + '/tx/' + hash;
    return this.httpClient.get<ApiTx>(url);
  }

  public getCoins(txId: string): Observable<CoinsApiResponse> {
    const url: string = this.api.getUrl() + '/tx/' + txId + '/coins';
    return this.httpClient.get<CoinsApiResponse>(url);
  }

  public getConfirmations(blockheight: number): Observable<number> {
    return this.blocksProvider.getCurrentHeight().map(data => {
      return blockheight >= 0 ? data.height - blockheight : blockheight;
    });
  }

  public getLatestTransaction(): Observable<any> {
    const url: string = this.api.getUrl() + '/tx/latest';
    return this.httpClient.get<any>(url)
  }

  public getDecodeRawTx(txId: string): any {
    const url: string = `${this.api.getUrl()}/tx/${txId}/decoderaw`;
    return this.httpClient.get<any>(url);
  }
}
