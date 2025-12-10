/**
 * Market Data Models
 *
 * Defines interfaces for market-related data including:
 * - Trading pairs and exchanges
 * - Market overview statistics
 * - Global market metrics
 */

// ==================== Trading Pairs ====================

/**
 * Trading pair information from an exchange
 * Represents where a coin can be traded and at what price
 */
export interface Market {
  /** Exchange name (e.g., 'Binance', 'Coinbase') */
  exchange: string;
  /** Trading pair (e.g., 'BTC/USDT') */
  pair: string;
  /** Current price on this exchange */
  price: string;
  /** 24h trading volume */
  volume: string;
  /** Data reliability indicator */
  confidence: 'High' | 'Medium' | 'Low';
  /** Last update timestamp */
  updated: string;
}

// ==================== Market Statistics ====================

/**
 * General market statistics display item
 * Used for key metrics in UI cards and dashboards
 */
export interface MarketStats {
  /** Stat name/title */
  title: string;
  /** Current value */
  value: string;
  /** Percentage change (optional) */
  change?: string;
  /** Additional context (optional) */
  subtitle?: string;
  /** True if change is positive */
  isPositive?: boolean;
}

// ==================== Global Market Overview ====================

/**
 * Comprehensive global cryptocurrency market overview
 *
 * Contains aggregated statistics about the entire crypto market including:
 * - Total market capitalization
 * - Market dominance metrics
 * - Fear & Greed Index
 * - Trading volume statistics
 */
export interface MarketOverview {
  /** Total crypto market cap (formatted) */
  totalMarketCap: string;
  /** 24h change in market cap (decimal, e.g., "0.05" for 5%) */
  totalMarketCapChange24h: string;
  /** CMC 20 Index value */
  cmc20: string;
  /** Fear & Greed Index score (0-100) */
  fearGreedIndex: string;
  /** Text description of Fear & Greed sentiment */
  fear_and_greed_text: string;
  /** Total 24h trading volume */
  totalVolume24h: string;
  /** 24h change in volume */
  totalVolume24hChange: string;
  /** Bitcoin market dominance (decimal) */
  btcDominance: string;
  /** Ethereum market dominance (decimal) */
  ethDominance: string;
  /** Bitcoin dominance percentage (formatted with %) */
  btcDominancePercent: string;
  /** Ethereum dominance percentage (formatted with %) */
  ethDominancePercent: string;
  /** Altcoin season indicator score */
  altcoinSeasonIndex: number;
}
