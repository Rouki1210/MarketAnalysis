/**
 * Common Type Definitions and Interfaces
 *
 * Shared types and interfaces used across the application
 */

// ==================== Currency & Display Types ====================

/** Supported currencies for price display */
export type Currency = 'USD' | 'VND' | 'BTC' | 'ETH';

/** Time periods for historical data */
export type TimeFrame = '1h' | '24h' | '7d' | '30d' | '1y' | 'all';

/** Chart timeframe selections (user-facing) */
export type ChartTimeframe = '1D' | '7D' | '1M' | '3M' | '1Y' | 'ALL' | 'LOG';

/** Application theme options */
export type Theme = 'light' | 'dark';

// ==================== Filtering & Pagination ====================

/**
 * Filter options for cryptocurrency lists
 * Used in tables and search functionality
 */
export interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  timeframe?: TimeFrame;
  network?: string;
}

/**
 * Pagination metadata for paginated list responses
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

/**
 * Sort configuration for table columns
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// ==================== API Response Types ====================

/**
 * Generic API response wrapper
 * Provides consistent structure for all API responses
 * @template T Type of data payload
 */
export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
}

// ==================== Chart Data Types ====================

/**
 * Basic chart data point for line charts
 * Includes time and price, optionally volume
 */
export interface ChartData {
  time: string;
  price: number;
  volume?: number;
}

/**
 * OHLC (Open, High, Low, Close) candlestick data
 * Used for advanced price charts with full candle information
 */
export interface OHLCData {
  symbol: string;
  periodStart: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Simplified chart point with timestamp and price
 * Used for basic line charts
 */
export interface ChartPoint {
  timestamp: string;
  price: number;
}

// ==================== Global Market Metrics ====================

/**
 * Historical global cryptocurrency market metrics snapshot
 * Contains aggregated market-wide statistics at a specific point in time
 */
export interface GlobalMetricHistory {
  id: number;
  total_market_cap_usd: number;
  total_market_cap_percent_change_24h: number;
  total_volume_24h: number;
  total_volume_24h_percent_change_24h: number;
  bitcoin_dominance_percentage: number;
  ethereum_dominance_percentage: number;
  timestampUtc: string;
}
