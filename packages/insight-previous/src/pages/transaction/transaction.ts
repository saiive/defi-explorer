import { Component, Injectable } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { keys } from 'lodash';
import { ApiProvider, ChainNetwork } from '../../providers/api/api';
import { CurrencyProvider } from '../../providers/currency/currency';
import { Logger } from '../../providers/logger/logger';
import { PriceProvider } from '../../providers/price/price';
import { RedirProvider } from '../../providers/redir/redir';
import { TxsProvider } from '../../providers/transactions/transactions';

const CUSTOM_TX_TYPE = {
  C: 'createMasternode',
  R: 'resignMasternode',
  T: 'createToken',
  M: 'mintToken',
  N: 'updateToken',
  n: 'updateTokenAny',
  p: 'createPoolPair',
  u: 'updatePoolPair',
  s: 'poolSwap',
  l: 'addPoolLiquidity',
  r: 'removePoolLiquidity',
  U: 'utxosToAccount',
  b: 'accountToUtxos',
  B: 'accountToAccount',
  G: 'setGovVariable',
  a: 'AnyAccountsToAccounts'
}

@Injectable()
@IonicPage({
  name: 'transaction',
  segment: ':chain/:network/tx/:txId',
  defaultHistory: ['home']
})
@Component({
  selector: 'page-transaction',
  templateUrl: 'transaction.html'
})
export class TransactionPage {
  public loading = true;
  public tx: any = {};
  public vout: number;
  public fromVout: boolean;
  public confirmations: number;
  public errorMessage: string;
  public isSkipped: boolean;
  public keys: (object?: any) => string[];
  public JSON: JSON;

  private txId: string;
  private chainNetwork: ChainNetwork;

  constructor(
    public navParams: NavParams,
    public currencyProvider: CurrencyProvider,
    public redirProvider: RedirProvider,
    private apiProvider: ApiProvider,
    private txProvider: TxsProvider,
    private logger: Logger,
    private priceProvider: PriceProvider,
  ) {
    this.JSON = JSON;
    this.keys = keys;
    this.txId = navParams.get('txId');
    this.vout = navParams.get('vout');
    this.fromVout = navParams.get('fromVout') || undefined;

    const chain: string =
      navParams.get('chain') || this.apiProvider.getConfig().chain;
    const network: string =
      navParams.get('network') || this.apiProvider.getConfig().network;

    this.chainNetwork = {
      chain,
      network
    };
    this.apiProvider.changeNetwork(this.chainNetwork);
    this.currencyProvider.setCurrency();
    this.priceProvider.setCurrency();
  }

  public ionViewDidLoad(): void {
    this.txProvider.getTx(this.txId).subscribe(
      data => {
        this.tx = this.txProvider.toAppTx(data);
        this.loading = false;
        this.txProvider
          .getConfirmations(this.tx.blockheight)
          .subscribe(confirmations => {
            if (confirmations === -3) {
              this.errorMessage =
                'This transaction is invalid and will never confirm, because some of its inputs are already spent.';
            }
            this.confirmations = confirmations;
          });
        this.isSkipped = !this.tx.isCustomTxApplied && this.tx.chain === 'DFI' && this.tx.isCustom;
        // Be aware that the tx component is loading data into the tx object
      },
      err => {
        this.logger.error(err.message);
        this.errorMessage = err.error || err.message;
        this.loading = false;
      }
    );
  }

  public goToBlock(blockHash: string): void {
    this.redirProvider.redir('block-detail', {
      blockHash,
      chain: this.chainNetwork.chain,
      network: this.chainNetwork.network
    });
  }

  public txType(type: string): string {
    return CUSTOM_TX_TYPE[type];
  }
}
