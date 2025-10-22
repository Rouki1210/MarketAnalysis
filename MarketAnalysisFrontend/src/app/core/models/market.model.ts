export interface Market {
  exchange: string;
  pair: string;
  price: string;
  volume: string;
  confidence: 'High' | 'Medium' | 'Low';
  updated: string;
}

export interface MarketStats {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  isPositive?: boolean;
}

export interface MarketOverview {
  totalMarketCap: string;
  cmc20: string;
  fearGreedIndex: string;
  fear_and_greed_text: string;
  totalVolume24h: string;
  btcDominance: string;
  ethDominance: string;
  btcDominancePercent: string;
  ethDominancePercent: string;
  altcoinSeasonIndex: number;
}

