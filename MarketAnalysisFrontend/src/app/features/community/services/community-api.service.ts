import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import * as SignalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
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

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  startNotificationHub(): void {
    if (this.hubConnection) return;
    this.hubConnection = new SignalR.HubConnectionBuilder()
      .withUrl(this.hubURL, {
        accessTokenFactory: () => this.getToken() || ""
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
      .catch(err => {
        this.connectionState.next(SignalR.HubConnectionState.Disconnected);
        console.error('SignalR Connection Error:', err);
      });
  }

  stopNotificationHub(): void {
    this.hubConnection?.stop();
    this.hubConnection = undefined;
  }

  // Expose notifications as Observable
  getNotificationStream(): Observable<any> {
    return this.notificationSubject.asObservable();
  }

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
    return throwError(() => ({ status: error.status, message: errorMessage, error }));
  }

  get<T>(url: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.baseURL}${url}`, {
      headers: this.getHeaders(),
      params: params
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  post<T>(url: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseURL}${url}`, data, {
      headers: this.getHeaders()
    }).pipe(
      tap((response: any) => {
        console.log(`✅ POST ${url} Success:`, response);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  put<T>(url: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseURL}${url}`, data, {
      headers: this.getHeaders()
    }).pipe(
      tap((response: any) => {
        console.log(`✅ PUT ${url} Success:`, response);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseURL}${url}`, {
      headers: this.getHeaders()
    }).pipe(
      tap((response: any) => {
        console.log(`✅ DELETE ${url} Success:`, response);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }
}

