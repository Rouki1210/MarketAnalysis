import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MarketOverviewResponse } from '../models/market-overview.model';

/**
 * MarketAiService
 *
 * Handles AI-powered market overview analysis.
 * Fetches comprehensive market analysis from AI engine including:
 * - Overall market sentiment
 * - Key trends and patterns
 * - Notable market movements
 * - Trading recommendations
 *
 * Provides loading and error state observables for UI feedback.
 */
@Injectable({
  providedIn: 'root',
})
export class MarketAiService {
  // API endpoint for market AI analysis
  private readonly apiUrl = 'https://localhost:7175/api/AIAnalysis/market';

  // Loading state observable for UI spinners
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Error state observable for UI error messages
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Fetch AI-generated market overview analysis
   * Sets loading state during request and error state on failure
   *
   * @returns Observable with market overview AI analysis
   */
  getMarketOverview(): Observable<MarketOverviewResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<MarketOverviewResponse>(this.apiUrl).pipe(
      tap(() => {
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        this.loadingSubject.next(false);
        this.errorSubject.next(
          error.message || 'Failed to load market overview'
        );
        throw error;
      })
    );
  }
}
