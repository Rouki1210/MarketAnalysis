/**
 * Watchlist Models
 * Defines interfaces for watchlist functionality
 */

/**
 * Backend DTO for Asset
 */
export interface AssetDto {
  id: number;
  symbol: string;
  name: string;
}

/**
 * Backend DTO for Watchlist
 */
export interface WatchlistDto {
  id: number;
  name: string;
  assets: AssetDto[];
}

/**
 * Response from toggle endpoint
 */
export interface ToggleAssetResponse {
  success: boolean;
  added: boolean;
  watchlist: WatchlistDto;
}

/**
 * Response from get watchlist endpoint
 */
export interface WatchlistResponse {
  success: boolean;
  data: WatchlistDto;
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
