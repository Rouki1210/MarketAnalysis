import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';

/**
 * Application Routes
 *
 * Main routing configuration using lazy loading for optimal performance.
 * All routes are wrapped in ShellComponent which provides:
 * - Header with navigation and alerts
 * - Footer
 * - Main content area
 *
 * Route structure:
 * - '/' and '/markets' => Dashboard (cryptocurrency table)
 * - '/coin/:symbol' => Individual coin detail pages
 * - '/profile' => User profile and alerts management
 * - '/community' => Social features (feed, posts, articles)
 * - '**' => Catch-all redirects to dashboard
 */
export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        // Dashboard - main cryptocurrency table
        path: '',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.dashboardRoutes
          ),
      },
      {
        // Markets - alias for dashboard
        path: 'markets',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.dashboardRoutes
          ),
      },
      {
        // Individual coin detail pages
        path: 'coin',
        loadChildren: () =>
          import('./features/coin/coin.routes').then((m) => m.coinRoutes),
      },
      {
        // User profile and alert management
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.routes').then(
            (m) => m.profileRoutes
          ),
      },
      {
        // Community social features
        path: 'community',
        loadChildren: () =>
          import('./features/community/community.routes').then(
            (m) => m.communityRoutes
          ),
      },
      {
        // Catch-all redirect to dashboard
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
