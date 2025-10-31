import { Injectable, signal, effect } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { WatchlistCoin, WatchlistStorage } from '../models/watchlist.model';
import { Coin } from '../models/coin.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

/**
 * WatchlistService
 * Manages cryptocurrency watchlist functionality including:
 * - Adding/removing coins from watchlist (requires authentication)
 * - Persisting watchlist to localStorage per user
 * - Providing real-time coin data for watchlist items
 */
@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private readonly STORAGE_KEY_PREFIX = 'watchlist_coins_';
  
  // Observable state for watchlist coin IDs
  private watchlistIdsSubject = new BehaviorSubject<string[]>([]);
  public watchlistIds$ = this.watchlistIdsSubject.asObservable();
  
  // Observable state for full watchlist coin data
  private watchlistCoinsSubject = new BehaviorSubject<WatchlistCoin[]>([]);
  public watchlistCoins$ = this.watchlistCoinsSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    // Load watchlist when user is authenticated
    this.loadWatchlistFromLocalStorage();
    
    // Subscribe to coin updates and merge with watchlist
    this.setupWatchlistDataSync();
    
    // Watch for auth state changes using effect
    effect(() => {
      const isAuth = this.authService.isAuthenticated();
      if (isAuth) {
        this.loadWatchlistFromLocalStorage();
      } else {
        // Clear watchlist when user logs out
        this.clearWatchlistOnLogout();
      }
    });
  }

  /**
   * Toggle a coin in the watchlist (add if not present, remove if present)
   * Requires user to be authenticated
   */
  toggleWatchlist(coinId: string): boolean {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.authService.openAuthModal('login');
      return false;
    }
    
    const currentIds = this.watchlistIdsSubject.value;
    const index = currentIds.indexOf(coinId);
    
    let newIds: string[];
    if (index > -1) {
      // Remove from watchlist
      newIds = currentIds.filter(id => id !== coinId);
    } else {
      // Add to watchlist
      newIds = [...currentIds, coinId];
    }
    
    this.watchlistIdsSubject.next(newIds);
    this.saveWatchlistToLocalStorage(newIds);
    return true;
  }

  /**
   * Check if a coin is in the watchlist
   */
  isInWatchlist(coinId: string): boolean {
    return this.watchlistIdsSubject.value.includes(coinId);
  }

  /**
   * Get current watchlist coin IDs
   */
  getWatchlistIds(): string[] {
    return this.watchlistIdsSubject.value;
  }

  /**
   * Get storage key for current user
   */
  private getUserStorageKey(): string | null {
    const user = this.authService.currentUser();
    if (!user?.email) {
      return null;
    }
    // Use email as unique identifier for user's watchlist
    return `${this.STORAGE_KEY_PREFIX}${user.email}`;
  }

  /**
   * Load watchlist from localStorage for current user
   */
  private loadWatchlistFromLocalStorage(): void {
    try {
      const storageKey = this.getUserStorageKey();
      if (!storageKey) {
        this.watchlistIdsSubject.next([]);
        return;
      }
      
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data: WatchlistStorage = JSON.parse(stored);
        this.watchlistIdsSubject.next(data.coinIds || []);
      } else {
        this.watchlistIdsSubject.next([]);
      }
    } catch (error) {
      console.error('Error loading watchlist from localStorage:', error);
      this.watchlistIdsSubject.next([]);
    }
  }

  /**
   * Save watchlist to localStorage for current user
   */
  private saveWatchlistToLocalStorage(coinIds: string[]): void {
    try {
      const storageKey = this.getUserStorageKey();
      if (!storageKey) {
        console.warn('Cannot save watchlist: User not authenticated');
        return;
      }
      
      const data: WatchlistStorage = {
        coinIds,
        timestamp: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving watchlist to localStorage:', error);
      // Handle quota exceeded or other localStorage errors
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Watchlist not saved.');
      }
    }
  }

  /**
   * Clear watchlist in memory when user logs out (but keep in localStorage)
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
    combineLatest([
      this.watchlistIds$,
      this.apiService.coins$
    ]).pipe(
      map(([watchlistIds, allCoins]) => {
        // Filter coins that are in the watchlist
        const watchlistCoins: WatchlistCoin[] = watchlistIds
          .map(id => {
            // Try to find coin by ID first, then by symbol (case-insensitive)
            // Also handle string/number type mismatches
            const coin = allCoins.find(c => 
              String(c.id) === String(id) || 
              c.symbol.toLowerCase() === String(id).toLowerCase()
            );
            
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
              sparklineData: coin.sparklineData
            } as WatchlistCoin;
          })
          .filter(coin => coin !== null) as WatchlistCoin[];
        
        return watchlistCoins;
      })
    ).subscribe(watchlistCoins => {
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
    
    this.watchlistIdsSubject.next([]);
    this.saveWatchlistToLocalStorage([]);
  }

  /**
   * Check if user is authenticated (for UI state)
   */
  isUserAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
