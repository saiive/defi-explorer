import { Component, Input, OnInit } from '@angular/core';
import { ApiProvider } from '../../providers/api/api';
import { CurrencyProvider } from '../../providers/currency/currency';
import { RedirProvider } from '../../providers/redir/redir';
import {
  TxsProvider,
  ApiCoin,
} from '../../providers/transactions/transactions';

@Component({
  selector: 'show-transaction-info',
  templateUrl: 'show-transaction-info.html',
})
export class ShowTransactionInfo implements OnInit {
  @Input()
  public coin: any = {};
  public tx: any = {};
  public loading: boolean = true;
  public errorMessage: string = '';
  public confirmations: number;
  private COIN = 100000000;
  public aggregateVinData:any[] = [];
  public aggregateVoutData:any[] = [];

  constructor(
    public apiProvider: ApiProvider,
    public currencyProvider: CurrencyProvider,
    public redirProvider: RedirProvider,
    public txProvider: TxsProvider
  ) {}

  public ngOnInit() {
    let txId;
    if (this.coin.height >= -1) {
      if (this.coin.mintTxid) {
        txId = this.coin.mintTxid;
      }
      if (this.coin.spentTxid) {
        txId = this.coin.spentTxid;
      }
      this.txProvider.getTx(txId).subscribe(
        (data) => {
          this.tx = this.txProvider.toAppTx(data);
          this.loading = false;
          this.getCoins();
          
        },
        (err) => {
          this.errorMessage = err.error || err.message;
          this.loading = false;
        }
      );
    }
  }

  public goToTx(txId: string): void {
    this.redirProvider.redir('transaction', {
      txId,
      chain: this.apiProvider.networkSettings.value.selectedNetwork.chain,
      network: this.apiProvider.networkSettings.value.selectedNetwork.network,
    });
  }

  public getCoins(): void {
    this.txProvider.getCoins(this.tx.txid).subscribe((data) => {
      this.tx.vin = data.inputs;
      this.tx.vout = data.outputs;
      this.tx.fee = this.txProvider.getFee(this.tx);
      this.tx.valueOut = data.outputs.reduce((a, b) => a + b.value, 0);
      this.getConfirmations();
      this.aggregateVinData = this.aggregateItems(this.tx.vin);
      this.aggregateVoutData = this.aggregateVout(this.tx.vout);
    });
  }

  public getConfirmations() {
    this.txProvider
      .getConfirmations(this.tx.blockheight)
      .subscribe((confirmations) => {
        if (confirmations === -3) {
          this.errorMessage =
            'This transaction is invalid and will never confirm, because some of its inputs are already spent.';
        }
        this.confirmations = confirmations;
      });
  }

  public aggregateItems(elements: any[]): any[] {
    if(Array.isArray(elements)) {
      const items = elements.filter((ele) => !(ele.scriptSig && !ele.address));
      if (!items) {
        return [];
      }
  
      const l: number = items.length;
  
      const ret: any[] = [];
      const tmp: any = {};
      let u = 0;
  
      for (let i = 0; i < l; i++) {
        let notAddr = false;
        // non standard input
        if (items[i].scriptSig && !items[i].address) {
          items[i].address = 'Unparsed address [' + u++ + ']';
          items[i].notAddr = true;
          notAddr = true;
        }
  
        // non standard output
        if (items[i].scriptPubKey && !items[i].scriptPubKey.addresses) {
          items[i].scriptPubKey.addresses = ['Unparsed address [' + u++ + ']'];
          items[i].notAddr = true;
          notAddr = true;
        }
  
        // multiple addr at output
        if (items[i].scriptPubKey && items[i].scriptPubKey.addresses.length > 1) {
          items[i].address = items[i].scriptPubKey.addresses.join(',');
          ret.push(items[i]);
          continue;
        }
  
        const address: string =
          items[i].address ||
          (items[i].scriptPubKey && items[i].scriptPubKey.addresses[0]);
  
        if (!tmp[address]) {
          tmp[address] = {};
          tmp[address].valueSat = 0;
          tmp[address].count = 0;
          tmp[address].value = 0;
          tmp[address].address = address;
          tmp[address].items = [];
        }
        tmp[address].isSpent = items[i].spentTxId;
  
        tmp[address].doubleSpentTxID =
          tmp[address].doubleSpentTxID || items[i].doubleSpentTxID;
        tmp[address].doubleSpentIndex =
          tmp[address].doubleSpentIndex || items[i].doubleSpentIndex;
        tmp[address].dbError = tmp[address].dbError || items[i].dbError;
        tmp[address].valueSat += Math.round(items[i].value * this.COIN);
        tmp[address].value += items[i].value;
        tmp[address].items.push(items[i]);
        tmp[address].notAddr = notAddr;
  
        if (items[i].unconfirmedInput) {
          tmp[address].unconfirmedInput = true;
        }
  
        tmp[address].count++;
      }
  
      for (const v of Object.keys(tmp)) {
        const obj: any = tmp[v];
        obj.value = obj.value || parseInt(obj.valueSat, 10) / this.COIN;
        ret.push(obj);
      }
  
      return ret; 
    }
    return [];
  }

  public aggregateVout(items: any[]): any[] {
    if (Array.isArray(items))
      return items.filter((ele) => ele.address !== 'false');
    return [];
  }

  public getAddress(v: ApiCoin): string {
    if (v.address === 'false') {
      return 'Unparsed address';
    }

    return v.address;
  }

  public goToAddress(addrStr: string): void {
    this.redirProvider.redir('address', {
      addrStr,
      chain: this.apiProvider.networkSettings.value.selectedNetwork.chain,
      network: this.apiProvider.networkSettings.value.selectedNetwork.network,
    });
  }
}
