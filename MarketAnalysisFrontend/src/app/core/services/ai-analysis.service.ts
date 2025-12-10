import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { CoinAnalysisResponse } from '../models/ai-analysis.model';

/**
 * AiAnalysisService
 *
 * Handles AI-powered cryptocurrency analysis for individual coins.
 * Fetches comprehensive coin analysis from AI engine including:
 * - Technical analysis (support/resistance, trends)
 * - Fundamental analysis (project health, development activity)
 * - Sentiment analysis (social media, news sentiment)
 * - Price predictions and trading signals
 *
 * Provides loading and error state observables for UI feedback.
 */
@Injectable({
  providedIn: 'root',
})
export class AiAnalysisService {
  // Backend API base URL
  private readonly apiUrl = 'https://localhost:7175/api';

  // Loading state observable for UI spinners
  private loadingSource = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSource.asObservable();

  // Error state observable for UI error messages
  private errorSource = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSource.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get AI analysis for a specific cryptocurrency
   * Fetches comprehensive AI-generated analysis including technical,
   * fundamental, and sentiment indicators
   *
   * @param symbol Cryptocurrency symbol (e.g., 'BTC', 'ETH')
   * @returns Observable with AI analysis response
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
            error.error?.error || error.message || 'Failed to load AI analysis';
          this.errorSource.next(errorMessage);
          this.loadingSource.next(false);
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Clear error state
   * Useful for dismissing error messages in UI
   */
  clearError(): void {
    this.errorSource.next(null);
  }
}
