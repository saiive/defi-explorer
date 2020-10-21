import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { ShowTransactionInfoComponentModule } from '../show-transaction-info/show-transaction-info.module';
import { CoinComponent } from './coin';

@NgModule({
  declarations: [CoinComponent],
  imports: [IonicModule, ShowTransactionInfoComponentModule],
  exports: [CoinComponent],
})
export class CoinComponentModule {}
