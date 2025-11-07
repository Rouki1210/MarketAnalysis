/**
 * Watchlist Models
 * Defines interfaces for watchlist functionality
 */

/**
 * Represents a user's watchlist containing cryptocurrency IDs
 */
export interface Watchlist {
  userId: string | null; // null for unauthenticated users
  coinIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Extended coin information for display in watchlist dropdown
 * Combines base coin data with real-time market information
 */
export interface WatchlistCoin {
  id: string;
  name: string;
  symbol: string;
  icon?: string;
  rank?: string;
  marketCap?: string;
  price?: string;
  change24h?: string;
  isPositive24h: boolean;
  sparklineData?: number[];
}
/**
 * Local storage structure for watchlist persistence
 */
export interface WatchlistStorage {
  coinIds: string[];
  timestamp: number;
}

export interface BackendWatchlist {
  id: number;
  userId: number;
  name: string;
  assets: BackendAsset[];
  createdAt: string;
  updatedAt: string;
}

export interface BackendAsset {
  id: number;
  symbol: string;
  name: string;
}
