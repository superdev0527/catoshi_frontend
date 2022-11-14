import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SwapComponent } from '../app/swap/swap.component';
import {HeaderComponent} from '../app/header/header.component';
import { PageNotFoundComponent } from '../app/page-not-found/page-not-found.component';
import { SwapV1V2Component } from './swapv1v2/swapv1v2.component';
import { UpdateTransactionComponent } from './update-transaction/update-transaction.component';
import { TransactonComponent } from '../app/transacton/transacton.component';
const routes: Routes = [
  {
    path : '',
    component : SwapComponent
  },
  {
    path : 'swap',
    component : SwapComponent
  },
  {
    path : 'header',
    component : HeaderComponent
  },
  {
    path : 'update-transaction',
    component :UpdateTransactionComponent
  },
  {
    path : 'transaction',
    component :TransactonComponent
  },
  {
    path : '**',
    component : PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
