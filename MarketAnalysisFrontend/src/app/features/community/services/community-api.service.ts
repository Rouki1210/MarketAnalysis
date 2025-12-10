import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import * as SignalR from '@microsoft/signalr';

/**
 * CommunityApiService
 *
 * Low-level HTTP and SignalR client for community features
 *
 * Features:
 * - HTTP methods (GET, POST, PUT, DELETE) with auth headers
 * - JWT token management (localStorage)
 * - SignalR real-time notifications hub
 * - Centralized error handling
 * - Auto-reconnect for SignalR
 * - Notification stream observable
 *
 * Used by higher-level services:
 * - PostService
 * - CommunityService
 * - UserService
 * - LeaderboardService
 */
@Injectable({
  providedIn: 'root',
})
export class CommunityApiService {
  private baseURL = 'https://localhost:7175/api'; // Change this to your API URL
  private hubURL = 'https://localhost:7175/notificationhub'; // Change this to your SignalR Hub URL
  private timeout = 10000;

  private hubConnection?: SignalR.HubConnection;
  private notificationSubject = new BehaviorSubject<Notification[]>([]);
  private connectionState = new BehaviorSubject<SignalR.HubConnectionState>(
    SignalR.HubConnectionState.Disconnected
  );

  constructor(private http: HttpClient) {}

  /**
   * Generate HTTP headers with JWT auth token
   * @private
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Start SignalR notification hub connection
   * Auto-reconnects on disconnect
   */
  startNotificationHub(): void {
    if (this.hubConnection) return;
    this.hubConnection = new SignalR.HubConnectionBuilder()
      .withUrl(this.hubURL, {
        accessTokenFactory: () => this.getToken() || '',
      })
      .withAutomaticReconnect()
      .build();
    this.hubConnection
      .start()
      .then(() => {
        this.connectionState.next(SignalR.HubConnectionState.Connected);
        console.log('SignalR Connected');
        this.hubConnection?.on('ReceiveNotification', (notification) => {
          this.notificationSubject.next(notification);
        });
      })
      .catch((err) => {
        this.connectionState.next(SignalR.HubConnectionState.Disconnected);
        console.error('SignalR Connection Error:', err);
      });
  }

  /** Stop SignalR connection */
  stopNotificationHub(): void {
    this.hubConnection?.stop();
    this.hubConnection = undefined;
  }

  /** Get notification stream observable */
  getNotificationStream(): Observable<any> {
    return this.notificationSubject.asObservable();
  }

  /**
   * Centralized HTTP error handler
   * @private
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
        localStorage.removeItem('token');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else if (error.status === 403) {
        errorMessage = 'Access forbidden.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Bad request.';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error.';
      } else {
        errorMessage = error.error?.message || `Error Code: ${error.status}`;
      }
    }

    console.error('API Error:', errorMessage, error);
    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error,
    }));
  }

  /** HTTP GET request */
  get<T>(url: string, params?: any): Observable<T> {
    return this.http
      .get<T>(`${this.baseURL}${url}`, {
        headers: this.getHeaders(),
        params: params,
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /** HTTP POST request */
  post<T>(url: string, data: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseURL}${url}`, data, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response: any) => {
          console.log(`✅ POST ${url} Success:`, response);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /** HTTP PUT request */
  put<T>(url: string, data: any): Observable<T> {
    return this.http
      .put<T>(`${this.baseURL}${url}`, data, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response: any) => {
          console.log(`✅ PUT ${url} Success:`, response);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /** HTTP DELETE request */
  delete<T>(url: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseURL}${url}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response: any) => {
          console.log(`✅ DELETE ${url} Success:`, response);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /** Check if user is authenticated */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  /** Get JWT token from localStorage */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** Save JWT token to localStorage */
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /** Remove JWT token from localStorage */
  removeToken(): void {
    localStorage.removeItem('token');
  }
}
