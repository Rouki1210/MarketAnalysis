import { Routes } from '@angular/router';
import { CoinPage } from './coin.page';

export const coinRoutes: Routes = [
  {
    path: ':symbol',
    component: CoinPage
  }
];

