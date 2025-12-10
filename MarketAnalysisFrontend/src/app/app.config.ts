import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { routes } from './app.routes';

/**
 * Application Configuration
 *
 * Root configuration for the Angular application providing:
 * - Change detection optimization with event coalescing
 * - Routing configuration
 * - HTTP client with authentication interceptor
 *
 * The authInterceptor automatically adds JWT tokens to all HTTP requests
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Optimize change detection performance
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Enable routing
    provideRouter(routes),
    // Configure HTTP client with auth interceptor
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
