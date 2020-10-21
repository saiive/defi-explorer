import { Component, Injectable } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { ApiProvider, ChainNetwork } from '../../providers/api/api';
import { BlocksProvider } from '../../providers/blocks/blocks';
import { CurrencyProvider } from '../../providers/currency/currency';
import { Logger } from '../../providers/logger/logger';
import { PriceProvider } from '../../providers/price/price';

@Injectable()
@IonicPage({
  name: 'anchored-blocks',
  segment: ':chain/:network/anchored-blocks',
  defaultHistory: ['home']
})
@Component({
  selector: 'page-anchored-blocks',
  templateUrl: 'anchored-blocks.html'
})
export class AnchoredBlocksPage {
  public loading = true;
  public totalBlocks = 0;
  public errorMessage;
  private chainNetwork: ChainNetwork;

  constructor(
    public navParams: NavParams,
    private apiProvider: ApiProvider,
    private logger: Logger,
    private blocksProvider: BlocksProvider,
    public currencyProvider: CurrencyProvider,
    private priceProvider: PriceProvider,
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
  }
  
  public ionViewWillLoad(): void {
    this.blocksProvider.getTotalAnchoredBlocks().subscribe(
      data => {
        this.totalBlocks = data.total;
        this.loading = false;
        this.errorMessage = '';
      },
      err => {
        this.logger.error(err.message);
        this.errorMessage = err.error || err.message;
        this.loading = false;
      }
    );
  }
}
