import { HttpClient } from '@angular/common/http';
import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicPage, NavParams, ToastController } from 'ionic-angular';
import { ApiProvider, ChainNetwork } from '../../providers/api/api';
import { CurrencyProvider } from '../../providers/currency/currency';
import { Logger } from '../../providers/logger/logger';
import { PriceProvider } from '../../providers/price/price';

const thresholdRichListElement = 1000;

@IonicPage({
  name: 'tx-decoder',
  segment: ':chain/:network/tx-decoder'
})
@Component({
  selector: 'page-tx-decoder',
  templateUrl: 'tx-decoder.html'
})
export class TxDecoderPage implements AfterViewInit, AfterViewChecked {
  public title: string;
  public transaction: string;
  public txForm: FormGroup;

  private chainNetwork: ChainNetwork;
  public rawTx: JSON;

  constructor(
    private toastCtrl: ToastController,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    private httpClient: HttpClient,
    private apiProvider: ApiProvider,
    private logger: Logger,
    private priceProvider: PriceProvider,
    private currencyProvider: CurrencyProvider
  ) {
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

    this.title = 'Broadcast Transaction';
    this.txForm = formBuilder.group({
      rawData: ['', Validators.pattern(/^[0-9A-Fa-f]+$/)]
    });
  }

  public send(): void {
    const postData: any = {
      rawTx: this.transaction
    };

    this.httpClient
      .post<any>(this.apiProvider.getUrl() + '/tx/decode', postData)
      .subscribe(
        data => {
          this.rawTx = data;
        },
        err => {
          this.logger.error(err.message);
          //this.presentToast(false, err.message);
        }
      );
  }

  public ngAfterViewInit() {

  }

  public ngAfterViewChecked() {

  }


}
