import { TransactionJSON } from '../Transaction';
import { ObjectId } from 'mongodb';
import { IBlock } from '../../models/block';
import { Request, Response } from 'express';
import { IWallet } from '../../models/wallet';
import { ChainNetwork } from '../../types/ChainNetwork';
import { StreamingFindOptions } from '../../services/storage';
import { MongoBound } from '../../models/base';
import { ITransaction } from '../../models/transaction';
import { AuthheadJSON } from '../Authhead';
import { CoinListingJSON } from '../Coin';
import { DailyTransactionsJSON } from '../stats';
export declare namespace CSP {
  export type StreamWalletTransactionsArgs = {
    startBlock: number;
    endBlock: number;
    startDate: string;
    endDate: string;
    includeMempool: boolean;
  } & StreamingFindOptions<ITransaction>;

  export type StreamAddressUtxosArgs = {
    unspent: boolean;
    limit: number;
  };

  export type GetBlockArgs = { limit: null | number };

  export type PubKey = { pubKey: string };

  export type GetBalanceForAddressParams = ChainNetwork & {
    address: string;
  };

  export type GetRichListParams = ChainNetwork & {
    pageNo: number;
    pageSize: number;
  };

  export type GetLatestTransactionsParams = ChainNetwork;

  export type GetBlockParams = ChainNetwork & {
    blockId?: string;
    sinceBlock?: number | string;
    anchorsOnly?: boolean;
    args?: Partial<{
      startDate: Date;
      endDate: Date;
      date: Date;
    } & StreamingFindOptions<IBlock>>;
  };
  export type StreamBlocksParams = ChainNetwork & {
    blockId?: string;
    sinceBlock: number | string;
    anchorsOnly: boolean;
    args?: Partial<{ startDate: Date; endDate: Date; date: Date; } & StreamingFindOptions<IBlock>>;
    req: Request;
    res: Response;
  };
  export type GetEstimateSmartFeeParams = ChainNetwork & {
    target: number;
  };
  export type BroadcastTransactionParams = ChainNetwork & {
    rawTx: string;
  };
  export type CreateWalletParams = IWallet;
  export type GetWalletParams = ChainNetwork & PubKey;

  export type UpdateWalletParams = ChainNetwork & {
    wallet: MongoBound<IWallet>;
    addresses: string[];
  };

  export type GetWalletBalanceParams = ChainNetwork & {
    wallet: MongoBound<IWallet>;
  };

  export type GetWalletBalanceAtTimeParams = ChainNetwork & {
    wallet: MongoBound<IWallet>;
    time: string;
  };

  export type StreamAddressUtxosParams = ChainNetwork & {
    address: string;
    req: Request;
    res: Response;
    args: StreamAddressUtxosArgs;
  };

  export type StreamTransactionsParams = ChainNetwork & {
    req: Request;
    res: Response;
    args: any;
  };
  export type StreamTransactionParams = ChainNetwork & {
    txId: string;
  };
  export type StreamWalletAddressesParams = ChainNetwork & {
    walletId: ObjectId;
    req: Request;
    res: Response;
    limit: number;
  };

  export type WalletCheckParams = ChainNetwork & {
    wallet: ObjectId;
  };

  export type StreamWalletMissingAddressesParams = ChainNetwork & {
    pubKey: string;
    req: Request;
    res: Response;
  };

  export type StreamWalletTransactionsParams = ChainNetwork & {
    wallet: MongoBound<IWallet>;
    req: Request;
    res: Response;
    args: StreamWalletTransactionsArgs;
  };
  export type StreamWalletUtxosArgs = { includeSpent: 'true' | undefined };
  export type StreamWalletUtxosParams = ChainNetwork & {
    wallet: MongoBound<IWallet>;
    limit: number;
    args: Partial<StreamWalletUtxosArgs>;
    req: Request;
    res: Response;
  };
  export type GetStatsParams = ChainNetwork;


  export type GetCoinCalculation = ChainNetwork;

  export type GetTotalAnchoredBlocks = ChainNetwork;

  export type Provider<T> = { get(params: { chain: string }): T };
  export type ChainStateProvider = Provider<IChainStateService> & IChainStateService;
  export interface IChainStateService {
    getBalanceForAddress(
      params: GetBalanceForAddressParams
    ): Promise<{ confirmed: number; unconfirmed: number; balance: number }>;
    getRichList(params: GetRichListParams): Promise<any>;
    getBlock(params: GetBlockParams): Promise<IBlock | string>;
    streamBlocks(params: StreamBlocksParams): any;
    getTotalAnchoredBlocks(params: GetTotalAnchoredBlocks): any;
    getFee(params: GetEstimateSmartFeeParams): any;
    broadcastTransaction(params: BroadcastTransactionParams): Promise<any>;
    createWallet(params: CreateWalletParams): Promise<IWallet>;
    getWallet(params: GetWalletParams): Promise<IWallet | null>;
    updateWallet(params: UpdateWalletParams): Promise<any>;
    getWalletBalance(
      params: GetWalletBalanceParams
    ): Promise<{ confirmed: number; unconfirmed: number; balance: number }>;
    getWalletBalanceAtTime(
      params: GetWalletBalanceAtTimeParams
    ): Promise<{ confirmed: number; unconfirmed: number; balance: number }>;
    streamAddressUtxos(params: StreamAddressUtxosParams): any;
    streamAddressTransactions(params: StreamAddressUtxosParams): any;
    streamTransactions(params: StreamTransactionsParams): any;
    getAuthhead(params: StreamTransactionParams): Promise<AuthheadJSON | undefined>;
    getDailyTransactions(params: { chain: string; network: string }): Promise<DailyTransactionsJSON>;
    getStats(params: GetStatsParams): Promise<any>;
    getCoinCalculation(params: GetCoinCalculation): Promise<any>;
    getTransaction(params: StreamTransactionParams): Promise<TransactionJSON | string | undefined>;
    streamWalletAddresses(params: StreamWalletAddressesParams): any;
    walletCheck(params: WalletCheckParams): any;
    streamWalletTransactions(params: StreamWalletTransactionsParams): any;
    streamWalletUtxos(params: StreamWalletUtxosParams): any;
    streamMissingWalletAddresses(params: StreamWalletMissingAddressesParams);
    getCoinsForTx(params: { chain: string; network: string; txid: string }): Promise<CoinListingJSON>;
    getLatestTransactions(params: GetLatestTransactionsParams): Promise<any>;
    getLocalTip(params): Promise<any>;
    getLocatorHashes(params): Promise<any>;
    getAccount(params): Promise<any>;
    getDecodeRawTx(params): Promise<JSON>;
    getDecode(params): Promise<JSON>;
    sendtoaddress(params: {  chain; network; address: string; amount: number | string }): Promise<JSON>;
    listallmasternodes(params): Promise<JSON>;
    listmasternodes(params): Promise<JSON>;

    icxListOrders(token: number, chain: number, orderTx: String, limit: number, closed: boolean): Promise<JSON>;
    icxGetOrder(orderTx: String): Promise<JSON>;
    icxListHtlcs(offerTx: String, limit: number, closed: boolean): Promise<JSON>;
  }

  type ChainStateServices = { [key: string]: IChainStateService };
}
