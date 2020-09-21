import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { CoinComponent } from './coin';
import { ShowTransactionInfoComponentModule } from '../show-transaction-info/show-transaction-info.module';

@NgModule({
  declarations: [CoinComponent],
  imports: [IonicModule, ShowTransactionInfoComponentModule],
  exports: [CoinComponent],
})
export class CoinComponentModule {}
