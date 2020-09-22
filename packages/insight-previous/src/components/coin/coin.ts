import { Component, Input, OnInit } from '@angular/core';
import { ApiProvider } from '../../providers/api/api';
import { CurrencyProvider } from '../../providers/currency/currency';
import { RedirProvider } from '../../providers/redir/redir';
import { AppCoin, TxsProvider } from '../../providers/transactions/transactions';

@Component({
  selector: 'coin',
  templateUrl: 'coin.html',
})
export class CoinComponent implements OnInit {
  @Input()
  public coin: AppCoin | any = {};
  @Input()
  public collapse: boolean = false;
  @Input()
  public txInfo: any = {};
  @Input()
  public blockTime: any = {};

  constructor(
    public apiProvider: ApiProvider,
    public currencyProvider: CurrencyProvider,
    public redirProvider: RedirProvider,
    public txsProvider: TxsProvider
  ) { }

  public ngOnInit(): void {
    const { mintTxid, spentTxid } = this.coin;
    this.txsProvider.getTx(mintTxid || spentTxid)
      .subscribe(
        response => {
          this.txInfo = response;
          this.blockTime = new Date(response.blockTime).getTime() / 1000;
        }
      );;
  }

  public goToTx(txId: string): void {
    this.redirProvider.redir('transaction', {
      txId,
      chain: this.apiProvider.networkSettings.value.selectedNetwork.chain,
      network: this.apiProvider.networkSettings.value.selectedNetwork.network,
    });
  }

  public collapsible() {
    this.collapse = !this.collapse;
  }
}
