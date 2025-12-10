import { Routes } from '@angular/router';
import { DashboardPage } from './dashboard.page';

/**
 * Dashboard Feature Routes
 *
 * Lazy-loaded routes for the main cryptocurrency dashboard
 * Displays the crypto table with real-time price updates
 */
export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardPage,
  },
];
