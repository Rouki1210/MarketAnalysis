export interface Coin {
  // Asset basic info
  id: string;
  name: string;
  symbol: string;
  description?: string;

  // Market data
  rank?: string;
  price?: string;
  change1h?: string;
  change24h?: string;
  change7d?: string;
  marketCap?: string;
  volume?: string;
  supply?: string;

  // Additional properties
  isPositive1h: boolean;
  isPositive24h: boolean;
  isPositive7d: boolean;

  // Metadata
  icon?: string;
  network?: string;
  sparklineData?: number[];

  // For real-time updates
  highlightClass?: string;
}


export interface CoinDetail {
  coin: Coin;
  stats: CoinStats;
  about?: string;
  contracts?: Contract[];
  links?: CoinLinks;
}

export interface CoinStats {
  marketCap: StatsItem;
  volume24h: StatsItem;
  volumeMarketCapRatio: string;
  maxSupply: string;
  circulatingSupply: string;
  totalSupply: string;
  fdv?: string;
  dominance?: string;
}

export interface StatsItem {
  value: string;
  change?: string;
  isPositive?: boolean;
}

export interface Contract {
  platform: string;
  address: string;
}

export interface CoinLinks {
  website?: string;
  whitepaper?: string;
  twitter?: string;
  reddit?: string;
  github?: string;
}

