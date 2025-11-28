/**
 * AI Analysis Models for Gemini API responses
 */

export interface Insight {
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface CoinAnalysisResponse {
  symbol: string;
  analyzedAt: string;
  insights: Insight[];
  source: string;
  currentPrice: number;
  percentChange7d: number;
}
