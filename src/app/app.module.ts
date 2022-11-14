import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DecimalPipe } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SwapComponent } from './swap/swap.component';
import { HeaderComponent } from './header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';
import { DeviceDetectorService } from 'ngx-device-detector';
// import { NgxSpinnerModule } from "ngx-spinner";
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HttpClientModule  } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DigitsOnlyDirective } from './directives/digits-only.directive';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxLoadingModule , ngxLoadingAnimationTypes  } from 'ngx-loading';
import { SwapV1V2Component } from './swapv1v2/swapv1v2.component';
import { UpdateTransactionComponent } from './update-transaction/update-transaction.component';
import { TransactonComponent } from './transacton/transacton.component';

@NgModule({
  declarations: [
    AppComponent,
    SwapComponent,
    HeaderComponent,
    PageNotFoundComponent,
    DigitsOnlyDirective,
    SwapV1V2Component,
    UpdateTransactionComponent,
    TransactonComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    NgxLoadingModule.forRoot({ }),
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      closeButton: true,
      easing: 'ease-in'
    }),
  ],
  providers: [DeviceDetectorService,DecimalPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
