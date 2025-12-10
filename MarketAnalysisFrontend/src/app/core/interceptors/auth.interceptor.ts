import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Authentication HTTP Interceptor
 *
 * Automatically attaches JWT authentication token to all outgoing HTTP requests.
 *
 * Functionality:
 * - Retrieves token from localStorage
 * - Adds Authorization header with Bearer token if available
 * - Passes request through unchanged if no token exists
 *
 * This ensures authenticated API calls work seamlessly without manual
 * header management in each service.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Retrieve authentication token from localStorage
  const token = localStorage.getItem('token');

  if (token) {
    // Clone request and add Authorization header
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  // No token - pass request through unchanged
  return next(req);
};
