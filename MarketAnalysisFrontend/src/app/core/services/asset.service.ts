import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Coin } from '../models/coin.model';

/**
 * AssetService
 *
 * Handles cryptocurrency asset search and data retrieval.
 * Combines asset metadata with current price information to provide
 * complete coin data for search results.
 */
@Injectable({
  providedIn: 'root',
})
export class AssetService {
  // Backend API base URL
  private readonly baseUrl = 'https://localhost:7175/api';

  constructor(private http: HttpClient) {}

  /**
   * Search for cryptocurrencies by name or symbol
   * Fetches asset metadata and combines with latest price data
   *
   * @param query Search query string (matches asset name or symbol)
   * @returns Observable with array of matching coins including price data
   */
  searchAssets(query: string): Observable<Coin[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/Asset/search`, {
        params: { query },
      })
      .pipe(
        switchMap((assets) => {
          if (assets.length === 0) {
            return of([]);
          }

          // Fetch latest prices for all assets
          return this.http.get<any[]>(`${this.baseUrl}/Prices`).pipe(
            map((prices) => {
              // Create price lookup map by symbol for O(1) access
              const priceMap = new Map(prices.map((p) => [p.symbol, p]));

              // Transform assets to Coin model with price data
              return assets.map((a) => {
                const priceData = priceMap.get(a.symbol);
                const price = priceData ? priceData.price : 0;

                // Number formatting helper
                const formatNumber = (num: number, digits: number = 2) =>
                  num?.toLocaleString(undefined, {
                    minimumFractionDigits: digits,
                    maximumFractionDigits: digits,
                  }) ?? '0';

                // Percentage formatting helper with sign
                const formatPercent = (val: number) => {
                  const sign = val >= 0 ? '+' : '';
                  return `${sign}${val.toFixed(2)}%`;
                };

                return {
                  id: a.id || a.symbol,
                  name: a.name,
                  symbol: a.symbol,
                  description: a.description,
                  price: `$${formatNumber(price)}`,
                  change1h: priceData
                    ? formatPercent(priceData.percentChange1h)
                    : '0.00%',
                  change7d: priceData
                    ? formatPercent(priceData.percentChange7d)
                    : '0.00%',
                  change24h: priceData
                    ? formatPercent(priceData.percentChange24h)
                    : '0.00%',
                  marketCap: priceData
                    ? `$${formatNumber(priceData.marketCap, 0)}`
                    : '$0',
                  volume: priceData
                    ? `$${formatNumber(priceData.volume, 0)}`
                    : '$0',
                  supply: priceData
                    ? `${formatNumber(priceData.supply, 0)} ${a.symbol}`
                    : '0',
                  rank: a.rank,
                  // Determine if price change is positive for styling
                  isPositive1h: priceData
                    ? priceData.percentChange1h >= 0
                    : true,
                  isPositive24h: priceData
                    ? priceData.percentChange24h >= 0
                    : true,
                  isPositive7d: priceData
                    ? priceData.percentChange7d >= 0
                    : true,
                  icon: a.logoUrl,
                  network: a.network,
                  sparklineData: [],
                };
              });
            }),
            catchError((err) => {
              console.error('Error fetching prices for search:', err);

              // Fallback: return assets without price data
              // Better to show results with missing prices than nothing
              return of(
                assets.map((a) => ({
                  id: a.id || a.symbol,
                  name: a.name,
                  symbol: a.symbol,
                  description: a.description,
                  price: '$0.00',
                  change1h: '0.00%',
                  change7d: '0.00%',
                  change24h: '0.00%',
                  marketCap: '$0',
                  volume: '$0',
                  supply: '0',
                  rank: a.rank,
                  isPositive1h: true,
                  isPositive24h: true,
                  isPositive7d: true,
                  icon: a.logoUrl,
                  network: a.network,
                  sparklineData: [],
                }))
              );
            })
          );
        })
      );
  }
}
