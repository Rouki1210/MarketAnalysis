/**
 * Cryptocurrency Coin Models
 *
 * Defines interfaces for coin/cryptocurrency data representation
 * throughout the application
 */

/**
 * Core cryptocurrency coin interface
 * Represents basic and market data for a cryptocurrency
 */
export interface Coin {
  // ===== Asset Basic Information =====
  id: string;
  name: string;
  symbol: string;
  description?: string;

  // ===== Market Data =====
  rank?: string;
  price?: string;
  change1h?: string;
  change24h?: string;
  change7d?: string;
  marketCap?: string;
  volume?: string;
  supply?: string;

  // ===== Price Trend Indicators =====
  /** True if 1h price change is positive */
  isPositive1h: boolean;
  /** True if 24h price change is positive */
  isPositive24h: boolean;
  /** True if 7d price change is positive */
  isPositive7d: boolean;

  // ===== Metadata =====
  icon?: string;
  network?: string;
  /** Array of recent prices for sparkline visualization */
  sparklineData?: number[];

  // ===== UI State =====
  /** CSS class for flash animation on price updates */
  highlightClass?: string;

  // ===== Analytics =====
  viewCount?: number;
  dateAdd?: string | Date;
}

/**
 * Detailed cryptocurrency information
 * Extends basic Coin with comprehensive stats and links
 */
export interface CoinDetail {
  coin: Coin;
  stats: CoinStats;
  about?: string;
  contracts?: Contract[];
  links?: CoinLinks;
}

/**
 * Statistical metrics for a cryptocurrency
 * Includes market cap, volume, supply information
 */
export interface CoinStats {
  marketCap: StatsItem;
  volume24h: StatsItem;
  volumeMarketCapRatio: string;
  maxSupply: string;
  circulatingSupply: string;
  totalSupply: string;
  fdv?: string; // Fully Diluted Valuation
  dominance?: string;
}

/**
 * Individual statistics item with change tracking
 */
export interface StatsItem {
  value: string;
  change?: string;
  isPositive?: boolean;
}

/**
 * Smart contract deployment information
 * For tracking coin contracts on different blockchains
 */
export interface Contract {
  platform: string;
  address: string;
}

/**
 * External links and resources for a cryptocurrency
 */
export interface CoinLinks {
  website?: string;
  whitepaper?: string;
  twitter?: string;
  reddit?: string;
  github?: string;
}
