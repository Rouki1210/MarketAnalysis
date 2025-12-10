import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  ChartData,
  OHLCData,
  ChartPoint,
  GlobalMetricHistory,
} from '../models/common.model';

/**
 * ChartService
 *
 * Handles fetching and processing chart data for cryptocurrency price visualization.
 * Supports multiple chart types:
 * - OHLC (Open, High, Low, Close) candlestick charts
 * - Line charts with time-series price data
 * - Sparkline data for compact price trend visualization
 * - Global market metrics history
 */
@Injectable({
  providedIn: 'root',
})
export class ChartService {
  // Backend API base URL
  private readonly apiUrl = 'https://localhost:7175';

  constructor(private http: HttpClient) {}

  /**
   * Fetch OHLC (Open, High, Low, Close) data for candlestick charts
   * Used for advanced price visualization with volume indicators
   *
   * @param symbol Cryptocurrency symbol (e.g., 'BTC', 'ETH')
   * @param timeframe Data granularity ('1h', '1d', '1w', etc.)
   * @param from Optional start date for historical data
   * @param to Optional end date for historical data
   * @returns Observable array of OHLC data points
   */
  getOHLCData(
    symbol: string,
    timeframe: string,
    from?: Date,
    to?: Date
  ): Observable<OHLCData[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from.toISOString());
    if (to) params = params.set('to', to.toISOString());

    return this.http.get<OHLCData[]>(
      `${this.apiUrl}/api/Prices/ohlc/${symbol}?timeframe=${timeframe}`,
      { params }
    );
  }

  /**
   * Fetch simple price data for line charts
   * Returns timestamp and price pairs for basic price visualization
   *
   * @param symbol Cryptocurrency symbol
   * @param from Optional start date
   * @param to Optional end date
   * @returns Observable array of chart points (timestamp, price)
   */
  getPriceData(
    symbol: string,
    from?: Date,
    to?: Date
  ): Observable<ChartPoint[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from.toISOString());
    if (to) params = params.set('to', to.toISOString());

    return this.http
      .get<any[]>(`${this.apiUrl}/api/Prices/${symbol}`, { params })
      .pipe(
        map((data) =>
          data.map((item) => ({
            timestamp: item.timestampUtc,
            price: item.price,
          }))
        )
      );
  }

  /**
   * Fetch sparkline data for compact price trend visualization
   * Used in tables and summary cards to show quick price trends
   *
   * @param symbol Cryptocurrency symbol
   * @param days Number of days to fetch (default: 7)
   * @returns Observable array of price values
   */
  getSparklineData(symbol: string, days: number = 7): Observable<number[]> {
    return this.http
      .get<ChartPoint[]>(
        `${this.apiUrl}/api/Prices/sparkline/${symbol}?days=${days}`
      )
      .pipe(map((data) => data.map((item) => item.price)));
  }

  /**
   * Fetch historical global market metrics
   * Includes total market cap, volume, dominance, and other market-wide statistics
   *
   * @param timeframe Time range for historical data (e.g., '7d', '30d', '1y')
   * @returns Observable array of global metric snapshots
   */
  getGlobalMetricsHistory(
    timeframe: string = '7d'
  ): Observable<GlobalMetricHistory[]> {
    return this.http.get<GlobalMetricHistory[]>(
      `${this.apiUrl}/GlobalMetric/history?timeframe=${timeframe}`
    );
  }

  /**
   * Convert chart timeframe selection to actual date range
   * Maps user-friendly timeframes ('1D', '7D', etc.) to start/end dates
   *
   * @param timeframe User-selected timeframe
   * @returns Object with from and to dates
   */
  getDateRangeFromTimeframe(timeframe: string): { from: Date; to: Date } {
    const to = new Date();
    let from = new Date();

    switch (timeframe) {
      case '1D':
        from.setDate(to.getDate() - 1);
        break;
      case '7D':
        from.setDate(to.getDate() - 7);
        break;
      case '1M':
        from.setMonth(to.getMonth() - 1);
        break;
      case '3M':
        from.setMonth(to.getMonth() - 3);
        break;
      case '1Y':
        from.setFullYear(to.getFullYear() - 1);
        break;
      case 'ALL':
        // Bitcoin genesis block era
        from = new Date(2010, 0, 1);
        break;
      default:
        // Default to 7 days
        from.setDate(to.getDate() - 7);
    }

    return { from, to };
  }

  /**
   * Convert chart timeframe to appropriate API data granularity
   * Determines optimal data point frequency based on displayed timeframe
   * - Short timeframes (1D): hourly data
   * - Medium timeframes (7D, 1M): daily data
   * - Long timeframes (3M+): daily data
   *
   * @param chartTimeframe Chart timeframe selection
   * @returns API timeframe parameter
   */
  getAPITimeframe(chartTimeframe: string): string {
    switch (chartTimeframe) {
      case '1D':
        return '1h'; // Hourly data for 1-day view
      case '7D':
      case '1M':
        return '1d'; // Daily data for week/month views
      case '3M':
      case '1Y':
      case 'ALL':
        return '1d'; // Daily data for longer periods
      default:
        return '1d';
    }
  }
}
