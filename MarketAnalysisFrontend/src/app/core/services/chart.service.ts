import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ChartData, OHLCData, ChartPoint, GlobalMetricHistory } from '../models/common.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private readonly apiUrl = 'https://localhost:7175';

  constructor(private http: HttpClient) {}

  /**
   * Get OHLC data for advanced candlestick charts
   */
  getOHLCData(symbol: string, timeframe: string, from?: Date, to?: Date): Observable<OHLCData[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from.toISOString());
    if (to) params = params.set('to', to.toISOString());

    return this.http.get<OHLCData[]>(
      `${this.apiUrl}/api/Prices/ohlc/${symbol}?timeframe=${timeframe}`,
      { params }
    );
  }

  /**
   * Get price data for line charts
   */
  getPriceData(symbol: string, from?: Date, to?: Date): Observable<ChartPoint[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from.toISOString());
    if (to) params = params.set('to', to.toISOString());

    return this.http.get<any[]>(`${this.apiUrl}/api/Prices/${symbol}`, { params }).pipe(
      map(data => data.map(item => ({
        timestamp: item.timestampUtc,
        price: item.price
      })))
    );
  }

  /**
   * Get sparkline data for crypto table (simplified, last 7 days by default)
   */
  getSparklineData(symbol: string, days: number = 7): Observable<number[]> {
    return this.http.get<ChartPoint[]>(
      `${this.apiUrl}/api/Prices/sparkline/${symbol}?days=${days}`
    ).pipe(
      map(data => data.map(item => item.price))
    );
  }

  /**
   * Get global metrics historical data for dashboard charts
   */
  getGlobalMetricsHistory(timeframe: string = '7d'): Observable<GlobalMetricHistory[]> {
    return this.http.get<GlobalMetricHistory[]>(
      `${this.apiUrl}/GlobalMetric/history?timeframe=${timeframe}`
    );
  }

  /**
   * Convert timeframe to from/to dates
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
        from = new Date(2010, 0, 1); // Bitcoin genesis block era
        break;
      default:
        from.setDate(to.getDate() - 7);
    }

    return { from, to };
  }

  /**
   * Get appropriate API timeframe based on chart timeframe
   */
  getAPITimeframe(chartTimeframe: string): string {
    switch (chartTimeframe) {
      case '1D':
        return '1h';
      case '7D':
      case '1M':
        return '1d';
      case '3M':
      case '1Y':
      case 'ALL':
        return '1d';
      default:
        return '1d';
    }
  }
}
