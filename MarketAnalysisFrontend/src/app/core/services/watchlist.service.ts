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
 *
 * Manages user's cryptocurrency watchlist functionality including:
 * - Adding/removing coins from watchlist (requires authentication)
 * - Persisting watchlist to backend database per user
 * - Providing real-time coin data for watchlist items
 * - Automatic synchronization between watchlist and live market data
 *
 * The service maintains two observable streams:
 * - watchlistIds$: Array of asset IDs in watchlist
 * - watchlistCoins$: Full coin data for watchlist items with live prices
 */
@Injectable({
  providedIn: 'root',
})
export class WatchlistService {
  // Backend API endpoint for watchlist operations
  private readonly apiUrl = 'https://localhost:7175/api/Watchlist';

  /**
   * Generate HTTP headers with authentication token
   * @returns HttpHeaders with Content-Type and Authorization (if logged in)
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

  // Observable streams for watchlist state
  private watchlistIdsSubject = new BehaviorSubject<number[]>([]);
  public watchlistIds$ = this.watchlistIdsSubject.asObservable();

  private watchlistCoinsSubject = new BehaviorSubject<WatchlistCoin[]>([]);
  public watchlistCoins$ = this.watchlistCoinsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    // Set up automatic synchronization between watchlist IDs and coin data
    this.setupWatchlistDataSync();

    // Watch for authentication state changes
    // When user logs in, load their watchlist from database
    // When user logs out, clear watchlist from memory
    this.authService.currentUser$.subscribe((userInfo) => {
      console.log('🔄 User info changed:', userInfo);

      if (userInfo && userInfo.id) {
        // User logged in - load their watchlist
        console.log(
          '👤 User logged in with ID:',
          userInfo.id,
          '- loading watchlist...'
        );
        this.loadWatchlistFromDatabase(userInfo.id);
      } else {
        // User logged out - clear watchlist
        console.log('👋 No user info, clearing watchlist...');
        this.clearWatchlistOnLogout();
      }
    });
  }

  /**
   * Get current user ID from AuthService
   * @returns User ID or null if not authenticated
   * @private
   */
  private getUserId(): number | null {
    return this.authService.getCurrentUserId();
  }

  /**
   * Load watchlist from backend database for authenticated user
   * Fetches the user's default watchlist and updates local state
   *
   * @param userId Current user's ID
   * @private
   */
  private loadWatchlistFromDatabase(userId: number): void {
    this.http
      .get<WatchlistResponse>(`${this.apiUrl}/user/${userId}/default`)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            // Extract asset IDs from watchlist
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
   * Toggle a coin in the watchlist
   * If coin is in watchlist, removes it. If not in watchlist, adds it.
   * Requires user authentication - opens login modal if not logged in.
   *
   * @param coinId Asset ID to toggle
   * @returns True if toggle was attempted, false if user not authenticated
   */
  toggleWatchlist(coinId: number): boolean {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.authService.openAuthModal('login');
      return false;
    }

    const userId = this.getUserId();
    if (!userId) {
      console.warn('Cannot toggle watchlist: User ID not available');
      return false;
    }

    // Call backend API to toggle asset in watchlist
    this.http
      .post<ToggleAssetResponse>(
        `${this.apiUrl}/user/${userId}/toggle/${coinId}`,
        {}
      )
      .pipe(
        tap((response) => {
          if (response.success) {
            // Update local state with new watchlist
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
   * Check if a coin is currently in the watchlist
   * @param coinId Asset ID to check
   * @returns True if coin is in watchlist
   */
  isInWatchlist(coinId: number): boolean {
    return this.watchlistIdsSubject.value.includes(coinId);
  }

  /**
   * Get current watchlist coin IDs
   * @returns Array of asset IDs in watchlist
   */
  getWatchlistIds(): number[] {
    return this.watchlistIdsSubject.value;
  }

  /**
   * Clear watchlist from memory when user logs out
   * Does not delete from database - just clears local state
   * @private
   */
  private clearWatchlistOnLogout(): void {
    this.watchlistIdsSubject.next([]);
    this.watchlistCoinsSubject.next([]);
  }

  /**
   * Set up automatic synchronization between watchlist IDs and full coin data
   * Combines watchlist IDs with live coin data from ApiService to provide
   * always-up-to-date coin information for watchlist items
   * @private
   */
  private setupWatchlistDataSync(): void {
    // Combine watchlist IDs with all available coins
    combineLatest([this.watchlistIds$, this.apiService.coins$])
      .pipe(
        map(([watchlistIds, allCoins]) => {
          // Filter coins that are in the watchlist
          const watchlistCoins: WatchlistCoin[] = watchlistIds
            .map((assetId) => {
              // Find coin by asset ID
              const coin = allCoins.find((c) => Number(c.id) === assetId);

              if (!coin) {
                return null;
              }

              // Transform to WatchlistCoin format
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
        // Emit updated watchlist coins with live data
        this.watchlistCoinsSubject.next(watchlistCoins);
      });
  }

  /**
   * Clear entire watchlist for current user
   * Note: This only clears local state. To delete from database,
   * call backend API to remove all items individually
   */
  clearWatchlist(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    // Clear local state
    // TODO: Add backend API call to delete all watchlist items
    this.watchlistIdsSubject.next([]);
  }

  /**
   * Check if user is authenticated (helper for UI state)
   * @returns True if user is logged in
   */
  isUserAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
