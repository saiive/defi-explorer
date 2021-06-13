import { BTCStateProvider } from './btc/btc';
import { DFIStateProvider } from './dfi/dfi';
import { BCHStateProvider } from './bch/bch';
import { ETHStateProvider } from './eth/eth';
import { BATStateProvider } from './erc20/tokens/bat';
import { CSP } from '../../types/namespaces/ChainStateProvider';
import { Chain } from '../../types/ChainNetwork';

const services: CSP.ChainStateServices = {
  BTC: new BTCStateProvider(),
  DFI: new DFIStateProvider(),
  BCH: new BCHStateProvider(),
  ETH: new ETHStateProvider(),
  BAT: new BATStateProvider()
};

class ChainStateProxy implements CSP.ChainStateProvider {
  get({ chain }: Chain) {
    if (services[chain] == undefined) {
      throw new Error(`Chain ${chain} doesn't have a ChainStateProvider registered`);
    }
    return services[chain];
  }

  streamAddressUtxos(params: CSP.StreamAddressUtxosParams) {
    return this.get(params).streamAddressUtxos(params);
  }

  streamAddressTransactions(params: CSP.StreamAddressUtxosParams) {
    return this.get(params).streamAddressTransactions(params);
  }

  async getBalanceForAddress(params: CSP.GetBalanceForAddressParams) {
    return this.get(params).getBalanceForAddress(params);
  }

  async getRichList(params: CSP.GetRichListParams) {
    return this.get(params).getRichList(params);
  }

  async getBlock(params: CSP.GetBlockParams) {
    return this.get(params).getBlock(params);
  }

  streamBlocks(params: CSP.StreamBlocksParams) {
    return this.get(params).streamBlocks(params);
  }

  streamTransactions(params: CSP.StreamTransactionsParams) {
    return this.get(params).streamTransactions(params);
  }

  getAuthhead(params: CSP.StreamTransactionParams) {
    return this.get(params).getAuthhead(params);
  }

  getDailyTransactions(params: { chain: string; network: string }) {
    return this.get(params).getDailyTransactions(params);
  }

  getStats(params: CSP.GetStatsParams) {
    return this.get(params).getStats(params);
  }

  getCoinCalculation(params: CSP.GetCoinCalculation) {
    return this.get(params).getCoinCalculation(params);
  }

  getTransaction(params: CSP.StreamTransactionParams) {
    return this.get(params).getTransaction(params);
  }

  async createWallet(params: CSP.CreateWalletParams) {
    return this.get(params).createWallet(params);
  }

  async getWallet(params: CSP.GetWalletParams) {
    return this.get(params).getWallet(params);
  }

  streamWalletAddresses(params: CSP.StreamWalletAddressesParams) {
    return this.get(params).streamWalletAddresses(params);
  }

  walletCheck(params: CSP.WalletCheckParams) {
    return this.get(params).walletCheck(params);
  }

  async updateWallet(params: CSP.UpdateWalletParams) {
    return this.get(params).updateWallet(params);
  }

  async getTotalAnchoredBlocks(params: CSP.GetTotalAnchoredBlocks) {
    return this.get(params).getTotalAnchoredBlocks(params);
  }

  streamWalletTransactions(params: CSP.StreamWalletTransactionsParams) {
    return this.get(params).streamWalletTransactions(params);
  }

  async getWalletBalance(params: CSP.GetWalletBalanceParams) {
    return this.get(params).getWalletBalance(params);
  }

  async getWalletBalanceAtTime(params: CSP.GetWalletBalanceAtTimeParams) {
    return this.get(params).getWalletBalanceAtTime(params);
  }

  async getFee(params: CSP.GetEstimateSmartFeeParams) {
    return this.get(params).getFee(params);
  }

  streamWalletUtxos(params: CSP.StreamWalletUtxosParams) {
    return this.get(params).streamWalletUtxos(params);
  }

  async broadcastTransaction(params: CSP.BroadcastTransactionParams) {
    return this.get(params).broadcastTransaction(params);
  }

  registerService(currency: string, service: CSP.IChainStateService) {
    services[currency] = service;
  }

  async getCoinsForTx(params: { chain: string; network: string; txid: string }) {
    return this.get(params).getCoinsForTx(params);
  }

  async getLatestTransactions(params: CSP.GetLatestTransactionsParams) {
    return this.get(params).getLatestTransactions(params);
  }

  async getLocalTip(params) {
    return this.get(params).getLocalTip(params);
  }

  async getLocatorHashes(params) {
    return this.get(params).getLocatorHashes(params);
  }

  streamMissingWalletAddresses(params) {
    return this.get(params).streamMissingWalletAddresses(params);
  }

  async getAccount(params) {
    return this.get(params).getAccount(params);
  }
  async getDecodeRawTx(params) {
    return this.get(params).getDecodeRawTx(params);
  }

  async getDecode(params) {
    return this.get(params).getDecode(params);
  }

  async sendtoaddress(params: { chain; network; address: string; amount: string | number }) {
    return this.get(params).sendtoaddress(params);
  }

  async listallmasternodes(params) {
    return await (this.get(params)).listallmasternodes(params);
  }

  async listmasternodes(params) {
    return await (this.get(params)).listmasternodes(params);
  }

}
export let ChainStateProvider = new ChainStateProxy();
