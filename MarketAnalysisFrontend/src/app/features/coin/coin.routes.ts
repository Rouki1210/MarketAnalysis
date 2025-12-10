import { Routes } from '@angular/router';
import { CoinPage } from './coin.page';

/**
 * Coin Feature Routes
 *
 * Lazy-loaded routes for individual cryptocurrency detail pages
 * Route parameter :symbol specifies the cryptocurrency (e.g., 'btc', 'eth')
 */
export const coinRoutes: Routes = [
  {
    path: ':symbol',
    component: CoinPage,
  },
];
