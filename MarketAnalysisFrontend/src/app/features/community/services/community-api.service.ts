import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CommunityApiService {
  private baseURL = 'https://localhost:7175/api'; // Change this to your API URL
  private timeout = 10000;

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
      catchError(this.handleError.bind(this))
    );
  }

  put<T>(url: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseURL}${url}`, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseURL}${url}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}

