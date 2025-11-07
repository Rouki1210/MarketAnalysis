import { Injectable, signal, effect } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, firstValueFrom, map, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import {Watchlist, WatchlistCoin, WatchlistStorage, BackendWatchlist } from '../models/watchlist.model';
import { Coin } from '../models/coin.model';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

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
  private readonly apiUrl = 'https://localhost:7175/api/Watchlist';

  private currentWatchlistId: number | null = null;
  private userId: number | null = null;
  private isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    // Load watchlist when user is authenticated
    this.loadWatchlistFromLocalStorage();

    const isAuth = this.authService.isAuthenticated();
    const userId = this.authService.currentUser();
    if (isAuth) {
      this.initializeUserWatchlist();
    }
    
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

  private async initializeUserWatchlist(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      // Get and cache userId
      this.userId = await this.getUserId();
      
      if (this.userId) {
        console.log('User authenticated with ID:', this.userId);
        // Load watchlist from backend
        await this.loadWatchlistFromBackend();
      } else {
        console.warn('Could not get user ID, using localStorage only');
        this.loadWatchlistFromLocalStorage();
      }
    } catch (error) {
      console.error('Error initializing user watchlist:', error);
      // Fallback to localStorage
      this.loadWatchlistFromLocalStorage();
    } finally {
      this.isLoading = false;
    }
  }

  private async getUserId(): Promise<number | null> {
    try {
      const response = await firstValueFrom(this.authService.getUserInfo());
      if (response.success && response.user) {
        console.log("User ID in WatchlistService:", response.user.id);
        return response.user.id;
      }
      return null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

    public getWatchlistFromApi(): Observable<BackendWatchlist[]> {
    if (this.userId === null) {
      return throwError(() => new Error('User not authenticated'));
    }
    
    console.log(`Fetching watchlist for user ${this.userId}`);
    
    return this.http.get<BackendWatchlist[]>(`${this.apiUrl}/user/${this.userId}`).pipe(
      catchError(this.handleError)
    );
  }

  private async loadWatchlistFromBackend(): Promise<void> {
    try {
      const watchlists = await firstValueFrom(this.getWatchlistFromApi());
      
      console.log('Watchlists loaded from backend:', watchlists);
      
      if (watchlists && watchlists.length > 0) {
        // Use the first watchlist (or you can implement logic to select default)
        const defaultWatchlist = watchlists[0];
        this.currentWatchlistId = defaultWatchlist.id;
        
        // Extract asset symbols from backend response
        const coinIds = defaultWatchlist.assets?.map(asset => asset.symbol) || [];
        
        console.log('Extracted coin IDs:', coinIds);
        
        // Update local state
        this.watchlistIdsSubject.next(coinIds);
        
        // Also save to localStorage as cache
        this.saveWatchlistToLocalStorage(coinIds);
      } else {
        console.log('No watchlists found for user');
        this.watchlistIdsSubject.next([]);
      }
    } catch (error) {
      console.error('Error loading watchlist from backend:', error);
      // Fallback to localStorage
      this.loadWatchlistFromLocalStorage();
    }
  }

  private async createDefaultWatchlist(assetId: number): Promise<void> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; data: BackendWatchlist }>(
          `${this.apiUrl}/${this.userId}/watchlist-default`,
          null,
          { params: { assetId: assetId.toString() } }
        ).pipe(catchError(this.handleError))
      );

      if (response.success && response.data) {
        this.currentWatchlistId = response.data.id;
        console.log('Created default watchlist:', response.data);
      }
    } catch (error) {
      console.error('Error creating default watchlist:', error);
      throw error;
    }
  }

  private async addAssetToBackend(assetId: number): Promise<void> {
    if (!this.currentWatchlistId) {
      // Create watchlist if it doesn't exist
      await this.createDefaultWatchlist(assetId);
      return;
    }

    try {
      await firstValueFrom(
        this.http.post<{ success: boolean }>(
          `${this.apiUrl}/${this.currentWatchlistId}/add/${assetId}`,
          null
        ).pipe(catchError(this.handleError))
      );
      console.log(`Added asset ${assetId} to watchlist ${this.currentWatchlistId}`);
    } catch (error) {
      console.error('Error adding asset to backend:', error);
      throw error;
    }
  }

  private async removeAssetFromBackend(assetId: number): Promise<void> {
    if (!this.currentWatchlistId) {
      throw new Error('No watchlist found');
    }

    try {
      await firstValueFrom(
        this.http.delete<{ success: boolean }>(
          `${this.apiUrl}/${this.currentWatchlistId}/remove/${assetId}`
        ).pipe(catchError(this.handleError))
      );
      console.log(`Removed asset ${assetId} from watchlist ${this.currentWatchlistId}`);
    } catch (error) {
      console.error('Error removing asset from backend:', error);
      throw error;
    }
  }

  private handleError(error: any): Observable<never> {
    console.error('Watchlist API Error:', error);
    return throwError(() => new Error(error.error?.error || 'An error occurred'));
  }

  async toggleWatchlist(coinId: string): Promise<boolean> {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.authService.openAuthModal('login');
      return false;
    }
    
    const currentIds = this.watchlistIdsSubject.value;
    const index = currentIds.indexOf(coinId);
    
    try{
      if (index > -1) {
        await this.removeFromWatchlist(coinId);
      } else {
        await this.addToWatchlist(coinId);
      }
      return true;
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      return false;
    }
  }

  private async addToWatchlist(coinSymbol: string): Promise<void> {
    // Update local state immediately (optimistic update)
    const currentIds = this.watchlistIdsSubject.value;
    const newIds = [...currentIds, coinSymbol];
    this.watchlistIdsSubject.next(newIds);
    this.saveWatchlistToLocalStorage(newIds);

    // Sync with backend if user is authenticated and we have userId
    if (this.userId) {
      try {
        // Find the asset ID from coins list
        const coins = await firstValueFrom(this.apiService.coins$);
        const coin = coins.find(c => c.symbol === coinSymbol || c.id === coinSymbol);
        
        if (!coin) {
          throw new Error(`Coin ${coinSymbol} not found`);
        }

        const assetId = typeof coin.id === 'string' ? parseInt(coin.id, 10) : coin.id;

        if (isNaN(assetId)) {
          throw new Error(`Invalid asset ID for ${coinSymbol}`);
        }

        // Add to backend
        await this.addAssetToBackend(assetId);
        console.log(`Successfully added ${coinSymbol} to backend`);
      } catch (error) {
        console.error('Failed to sync with backend, keeping local changes:', error);
        // Keep local changes even if backend fails
      }
    }
  }

  private async removeFromWatchlist(coinSymbol: string): Promise<void> {
    // Update local state immediately (optimistic update)
    const currentIds = this.watchlistIdsSubject.value;
    const newIds = currentIds.filter(id => id !== coinSymbol);
    this.watchlistIdsSubject.next(newIds);
    this.saveWatchlistToLocalStorage(newIds);

    // Sync with backend if user is authenticated and we have userId
    if (this.userId && this.currentWatchlistId) {
      try {
        // Find the asset ID from coins list
        const coins = await firstValueFrom(this.apiService.coins$);
        const coin = coins.find(c => c.symbol === coinSymbol || c.id === coinSymbol);
        
        if (!coin) {
          throw new Error(`Coin ${coinSymbol} not found`);
        }

        const assetId = typeof coin.id === 'string' ? parseInt(coin.id, 10) : coin.id;

        if (isNaN(assetId)) {
          throw new Error(`Invalid asset ID for ${coinSymbol}`);
        }

        // Remove from backend
        await this.removeAssetFromBackend(assetId);
        console.log(`Successfully removed ${coinSymbol} from backend`);
      } catch (error) {
        console.error('Failed to sync with backend, keeping local changes:', error);
        // Keep local changes even if backend fails
      }
    }
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
    this.userId = null;
    this.currentWatchlistId = null;
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
  async clearWatchlist(): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      return;
    }
    
    const currentIds = this.watchlistIdsSubject.value;
    
    // Clear local state
    this.watchlistIdsSubject.next([]);
    this.saveWatchlistToLocalStorage([]);

    // Clear from backend if authenticated
    if (this.userId && this.currentWatchlistId) {
      for (const coinId of currentIds) {
        try {
          await this.removeFromWatchlist(coinId);
        } catch (error) {
          console.error(`Error removing ${coinId}:`, error);
        }
      }
    }
  }
  /**
   * Check if user is authenticated (for UI state)
   */
  isUserAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  async refreshWatchlist(): Promise<void> {
    if (!this.userId) {
      console.warn('Cannot refresh: User not authenticated');
      return;
    }

    try {
      await this.loadWatchlistFromBackend();
      console.log('Watchlist refreshed from backend');
    } catch (error) {
      console.error('Error refreshing watchlist:', error);
    }
  }
}
