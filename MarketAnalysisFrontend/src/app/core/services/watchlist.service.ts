import { Injectable, signal, effect } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map,
  catchError,
  of,
  tap,
} from 'rxjs';
import {
  WatchlistCoin,
  WatchlistDto,
  ToggleAssetResponse,
  WatchlistResponse,
} from '../models/watchlist.model';
import { Coin } from '../models/coin.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/**
 * WatchlistService
 * Manages cryptocurrency watchlist functionality including:
 * - Adding/removing coins from watchlist (requires authentication)
 * - Persisting watchlist to database per user
 * - Providing real-time coin data for watchlist items
 */
@Injectable({
  providedIn: 'root',
})
export class WatchlistService {
  private readonly apiUrl = 'https://localhost:7175/api/Watchlist';

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

  // Observable state for watchlist coin IDs (asset IDs from backend)
  private watchlistIdsSubject = new BehaviorSubject<number[]>([]);
  public watchlistIds$ = this.watchlistIdsSubject.asObservable();

  // Observable state for full watchlist coin data
  private watchlistCoinsSubject = new BehaviorSubject<WatchlistCoin[]>([]);
  public watchlistCoins$ = this.watchlistCoinsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    // Subscribe to coin updates and merge with watchlist
    this.setupWatchlistDataSync();

    // Watch for user info changes (better than isAuthenticated signal)
    this.authService.currentUser$.subscribe((userInfo) => {
      console.log('🔄 User info changed:', userInfo);

      if (userInfo && userInfo.id) {
        // User logged in and we have user ID
        console.log(
          '👤 User logged in with ID:',
          userInfo.id,
          '- loading watchlist...'
        );
        this.loadWatchlistFromDatabase(userInfo.id);
      } else {
        // User logged out or no user info
        console.log('👋 No user info, clearing watchlist...');
        this.clearWatchlistOnLogout();
      }
    });
  }

  /**
   * Get current user ID from AuthService
   */
  private getUserId(): number | null {
    return this.authService.getCurrentUserId();
  }

  /**
   * Load watchlist from database for current user
   */
  private loadWatchlistFromDatabase(userId: number): void {
    this.http
      .get<WatchlistResponse>(`${this.apiUrl}/user/${userId}/default`)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            const assetIds = response.data.assets.map((a) => a.id);
            this.watchlistIdsSubject.next(assetIds);
          }
        }),
        catchError((error) => {
          console.error('❌ Error loading watchlist from database:', error);
          this.watchlistIdsSubject.next([]);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Toggle a coin in the watchlist (add if not present, remove if present)
   * Requires user to be authenticated
   */
  toggleWatchlist(coinId: number): boolean {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.authService.openAuthModal('login');
      return false;
    }

    const userId = this.getUserId();
    if (!userId) {
      console.warn('Cannot toggle watchlist: User ID not available');
      return false;
    }

    // Call API to toggle asset
    this.http
      .post<ToggleAssetResponse>(
        `${this.apiUrl}/user/${userId}/toggle/${coinId}`,
        {}
      )
      .pipe(
        tap((response) => {
          if (response.success) {
            const assetIds = response.watchlist.assets.map((a) => a.id);
            this.watchlistIdsSubject.next(assetIds);
          }
        }),
        catchError((error) => {
          console.error('❌ Error toggling watchlist:', error);
          return of(null);
        })
      )
      .subscribe();

    return true;
  }

  /**
   * Check if a coin is in the watchlist
   */
  isInWatchlist(coinId: number): boolean {
    return this.watchlistIdsSubject.value.includes(coinId);
  }

  /**
   * Get current watchlist coin IDs
   */
  getWatchlistIds(): number[] {
    return this.watchlistIdsSubject.value;
  }

  /**
   * Clear watchlist in memory when user logs out
   */
  private clearWatchlistOnLogout(): void {
    this.watchlistIdsSubject.next([]);
    this.watchlistCoinsSubject.next([]);
  }

  /**
   * Setup real-time sync between watchlist IDs and coin data
   */
  private setupWatchlistDataSync(): void {
    // Combine watchlist IDs with coin data from API
    combineLatest([this.watchlistIds$, this.apiService.coins$])
      .pipe(
        map(([watchlistIds, allCoins]) => {
          // Filter coins that are in the watchlist
          const watchlistCoins: WatchlistCoin[] = watchlistIds
            .map((assetId) => {
              // Find coin by asset ID (which matches coin.id from backend)
              const coin = allCoins.find((c) => Number(c.id) === assetId);

              if (!coin) {
                return null;
              }

              return {
                id: coin.id,
                name: coin.name,
                symbol: coin.symbol,
                icon: coin.icon,
                rank: coin.rank,
                marketCap: coin.marketCap,
                price: coin.price,
                change24h: coin.change24h,
                isPositive24h: coin.isPositive24h,
                sparklineData: coin.sparklineData,
              } as WatchlistCoin;
            })
            .filter((coin) => coin !== null) as WatchlistCoin[];

          return watchlistCoins;
        })
      )
      .subscribe((watchlistCoins) => {
        this.watchlistCoinsSubject.next(watchlistCoins);
      });
  }

  /**
   * Clear entire watchlist for current user
   */
  clearWatchlist(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    // Clear in memory - could also call API to delete all items
    this.watchlistIdsSubject.next([]);
  }

  /**
   * Check if user is authenticated (for UI state)
   */
  isUserAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
