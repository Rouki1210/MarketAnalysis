import { Routes } from '@angular/router';
import { ProfilePage } from './profile.page';

/**
 * Profile Feature Routes
 *
 * Lazy-loaded routes for user profile and settings
 * Includes alert management and user preferences
 */
export const profileRoutes: Routes = [
  {
    path: '',
    component: ProfilePage,
  },
];
