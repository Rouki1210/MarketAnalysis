export interface MarketOverviewResponse {
  analyzedAt: string;
  overallTrend: 'bullish' | 'bearish' | 'neutral';
  insights: Insight[];
  topGainers: TopMover[];
  topLosers: TopMover[];
  statistics: MarketStatistics;
  source: string;
}

export interface Insight {
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface TopMover {
  symbol: string;
  name: string;
  price: number;
  percentChange24h: number;
  marketCap: number;
}

export interface MarketStatistics {
  totalMarketCap: number;
  totalVolume24h: number;
  totalCoins: number;
  btcDominance: number;
  ethDominance: number;
  coinsUp: number;
  coinsDown: number;
  marketBreadth: number;
  averageChange24h: number;
  medianChange24h: number;
  volumeToMarketCapRatio: number;
  volatilityIndex: number;
}
