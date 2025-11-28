import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { CoinAnalysisResponse } from '../models/ai-analysis.model';

@Injectable({
  providedIn: 'root',
})
export class AiAnalysisService {
  private readonly apiUrl = 'https://localhost:7175/api';

  // Loading state
  private loadingSource = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSource.asObservable();

  // Error state
  private errorSource = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSource.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get AI analysis for a specific cryptocurrency symbol
   * @param symbol Cryptocurrency symbol (e.g., 'BTC', 'ETH')
   * @returns Observable<CoinAnalysisResponse>
   */
  getAnalysis(symbol: string): Observable<CoinAnalysisResponse> {
    this.loadingSource.next(true);
    this.errorSource.next(null);

    return this.http
      .get<CoinAnalysisResponse>(`${this.apiUrl}/AIAnalysis/${symbol}`)
      .pipe(
        tap(() => {
          this.loadingSource.next(false);
        }),
        catchError((error) => {
          const errorMessage =
            error.error?.error || error.message || 'Không thể tải phân tích AI';
          this.errorSource.next(errorMessage);
          this.loadingSource.next(false);
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.errorSource.next(null);
  }
}
