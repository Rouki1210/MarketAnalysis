/**
 * Watchlist Models
 *
 * Defines interfaces for watchlist functionality including:
 * - Backend DTOs for API communication
 * - Frontend display models with enriched data
 * - API response structures
 */

// ==================== Backend DTOs ====================

/**
 * Asset Data Transfer Object
 * Minimal asset information from backend
 */
export interface AssetDto {
  id: number;
  symbol: string;
  name: string;
}

/**
 * Watchlist Data Transfer Object
 * Backend representation of a user's watchlist
 */
export interface WatchlistDto {
  id: number;
  name: string;
  assets: AssetDto[];
}

// ==================== API Response Models ====================

/**
 * Response from toggle asset endpoint
 * Indicates whether asset was added or removed
 */
export interface ToggleAssetResponse {
  /** True if operation successful */
  success: boolean;
  /** True if asset was added, false if removed */
  added: boolean;
  /** Updated watchlist with current assets */
  watchlist: WatchlistDto;
}

/**
 * Response from get watchlist endpoint
 * Returns user's watchlist data
 */
export interface WatchlistResponse {
  /** True if operation successful */
  success: boolean;
  /** Watchlist data */
  data: WatchlistDto;
}

// ==================== Frontend Display Models ====================

/**
 * Extended coin information for watchlist display
 *
 * Combines base asset data with real-time market information
 * for rich UI presentation in watchlist dropdown and views.
 *
 * This is an enriched version of the basic AssetDto with
 * live price data, trends, and visualization elements.
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
  /** True if 24h price change is positive */
  isPositive24h: boolean;
  /** Array of recent prices for sparkline chart */
  sparklineData?: number[];
}
