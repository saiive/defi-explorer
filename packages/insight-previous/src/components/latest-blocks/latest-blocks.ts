import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiProvider } from '../../providers/api/api';
import {
  AppBlock,
  BlocksProvider
} from '../../providers/blocks/blocks';
import { CurrencyProvider } from '../../providers/currency/currency';
import { DefaultProvider } from '../../providers/default/default';
import { Logger } from '../../providers/logger/logger';
import { RedirProvider } from '../../providers/redir/redir';

const BLOCK_AVERAGE_COUNT = 11;

@Component({
  selector: 'latest-blocks',
  templateUrl: 'latest-blocks.html'
})
export class LatestBlocksComponent implements OnInit, OnDestroy {
  @Input()
  public numBlocks: number;
  @Input()
  public showAllBlocksButton = false;
  @Input()
  public showLoadMoreButton = false;
  @Input()
  public showTimeAs: string;
  @Input()
  public showAnchoredBlocksButton = false;
  @Input()
  public totalBlocks: number = 0;
  public loading = true;
  public blocks: AppBlock[] = [];
  public subscriber: Subscription;
  public errorMessage: string;
  public enableInfiniteLoader = true;

  private reloadInterval: any;

  constructor(
    public currency: CurrencyProvider,
    public defaults: DefaultProvider,
    public redirProvider: RedirProvider,
    private blocksProvider: BlocksProvider,
    private apiProvider: ApiProvider,
    private ngZone: NgZone,
    private logger: Logger
  ) {
    this.numBlocks = parseInt(defaults.getDefault('%NUM_BLOCKS%'), 10);
  }

  public ngOnInit(): void {
    this.loadBlocks();
    if (!this.showAnchoredBlocksButton) {
      const seconds = 60;
      this.ngZone.runOutsideAngular(() => {
        this.reloadInterval = setInterval(() => {
          this.ngZone.run(() => {
            this.loadBlocks.call(this);
          });
        }, 1000 * seconds);
      });
    } else {
      this.loadBlocks.call(this);
    }
  }

  private processBlocks(blocks:AppBlock[]): AppBlock[] {
    return blocks.map((x, i) => {
      if(i >= (blocks.length - BLOCK_AVERAGE_COUNT)) {
        return x;
      }

      let medianTime = 0;
      for(let j = i;j < (i + BLOCK_AVERAGE_COUNT) && j < blocks.length;j++) {
        medianTime += blocks[j].time;
      }
      x.medianTime = medianTime / BLOCK_AVERAGE_COUNT;
      return x;
    })
  }

  private loadBlocks(): void {
    this.subscriber = this.blocksProvider
      .getBlocks(this.numBlocks + BLOCK_AVERAGE_COUNT, this.showAnchoredBlocksButton)
      .subscribe(
        response => {
          const blocks = this.processBlocks(response.map(block =>
            this.blocksProvider.toAppBlock(block)
          ));
          this.blocks = blocks;
          if (this.showAnchoredBlocksButton) {
            this.enableInfiniteLoader = this.blocks.length <= this.totalBlocks;
          }
          this.loading = false;
          this.errorMessage = '';
        },
        err => {
          this.subscriber.unsubscribe();
          clearInterval(this.reloadInterval);
          this.logger.error(err.message);
          this.errorMessage = err.error || err.message;
          this.loading = false;
        }
      );
  }

  public loadMoreBlocks(infiniteScroll) {
    clearInterval(this.reloadInterval);
    const since: number =
      this.blocks.length > 0 ? this.blocks[this.blocks.length - 1].height : 0;
    return this.blocksProvider
      .pageBlocks(since, this.numBlocks + BLOCK_AVERAGE_COUNT, this.showAnchoredBlocksButton)
      .subscribe(
        response => {
          const blocks = this.processBlocks(response.map(block =>
            this.blocksProvider.toAppBlock(block)
          ));
          this.blocks = this.blocks.concat(blocks);
          if (this.showAnchoredBlocksButton) {
            this.enableInfiniteLoader = this.blocks.length <= this.totalBlocks;
          }
          this.loading = false;
          infiniteScroll.complete();
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
      chain: this.apiProvider.networkSettings.value.selectedNetwork.chain,
      network: this.apiProvider.networkSettings.value.selectedNetwork.network
    });
  }

  public goToBlocks(): void {
    this.redirProvider.redir('blocks', {
      chain: this.apiProvider.networkSettings.value.selectedNetwork.chain,
      network: this.apiProvider.networkSettings.value.selectedNetwork.network
    });
  }

  public reloadData() {
    this.subscriber.unsubscribe();
    this.blocks = [];
    this.ngOnInit();
  }

  public ngOnDestroy(): void {
    clearInterval(this.reloadInterval);
  }

  public goToAddress(addrStr: string): void {
    this.redirProvider.redir('address', {
      addrStr,
      chain: this.apiProvider.networkSettings.value.selectedNetwork.chain,
      network: this.apiProvider.networkSettings.value.selectedNetwork.network
    });
  }

  public goToAnchoredBlocks(): void {
    // this.redirProvider.redir('anchored-blocks', {
    //   chain: this.apiProvider.networkSettings.value.selectedNetwork.chain,
    //   network: this.apiProvider.networkSettings.value.selectedNetwork.network
    // });
    window.open("https://dex.defichain.com/mainnet/anchors", "_blank");
  }
}
