import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MarketOverviewResponse } from '../models/market-overview.model';

@Injectable({
  providedIn: 'root',
})
export class MarketAiService {
  private readonly apiUrl = 'https://localhost:7175/api/AIAnalysis/market';

  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

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
