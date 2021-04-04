import { NgModule } from '@angular/core';
import { PrettyJsonModule } from 'angular2-prettyjson';
import { IonicPageModule } from 'ionic-angular';
import { ErrorComponentModule } from '../../components/error/error.module';
import { FooterComponentModule } from '../../components/footer/footer.module';
import { HeadNavComponentModule } from '../../components/head-nav/head-nav.module';
import { LoaderComponentModule } from '../../components/loader/loader.module';
import { RichListingsComponentModule } from '../../components/rich-listings/rich-listings.module';
import { TxDecoderPage } from './tx-decoder';

@NgModule({
  declarations: [TxDecoderPage],
  imports: [
    IonicPageModule.forChild(TxDecoderPage),
    RichListingsComponentModule,
    FooterComponentModule,
    HeadNavComponentModule,
    LoaderComponentModule,
    ErrorComponentModule,
    PrettyJsonModule  
  ],
  exports: [TxDecoderPage]
})
export class TxDecoder {}
