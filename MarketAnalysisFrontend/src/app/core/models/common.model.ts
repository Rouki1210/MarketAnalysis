export type Currency = 'USD' | 'VND' | 'BTC' | 'ETH';

export type TimeFrame = '1h' | '24h' | '7d' | '30d' | '1y' | 'all';

export type ChartTimeframe = '1D' | '7D' | '1M' | '3M' | '1Y' | 'ALL' | 'LOG';

export type Theme = 'light' | 'dark';

export interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  timeframe?: TimeFrame;
  network?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
}

export interface ChartData {
  time: string;
  price: number;
  volume?: number;
}

