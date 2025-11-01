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
  totalMarketCapChange24h: string;
  cmc20: string;
  fearGreedIndex: string;
  fear_and_greed_text: string;
  totalVolume24h: string;
  totalVolume24hChange: string;
  btcDominance: string;
  ethDominance: string;
  btcDominancePercent: string;
  ethDominancePercent: string;
  altcoinSeasonIndex: number;
}

