import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * RealtimeService
 *
 * Provides mock real-time cryptocurrency price updates.
 *
 * Note: This is a placeholder implementation using simulated data.
 * In production, this should be replaced with actual WebSocket connections
 * to cryptocurrency exchanges or price feed APIs.
 *
 * The actual real-time functionality is handled by ApiService using SignalR.
 * This service can be used for testing or as a fallback.
 */
@Injectable({
  providedIn: 'root',
})
export class RealtimeService {
  // Observable map of symbol -> current price
  private priceUpdates = new BehaviorSubject<Map<string, number>>(new Map());

  constructor() {
    this.startMockPriceStream();
  }

  /**
   * Get observable stream of all price updates
   * @returns Observable map of cryptocurrency symbols to prices
   */
  getPriceUpdates(): Observable<Map<string, number>> {
    return this.priceUpdates.asObservable();
  }

  /**
   * Get observable stream of price updates for a specific cryptocurrency
   * @param symbol Cryptocurrency symbol (e.g., 'BTC', 'ETH')
   * @returns Observable of current price for the symbol (undefined if not found)
   */
  getPriceForSymbol(symbol: string): Observable<number | undefined> {
    return this.priceUpdates.pipe(map((prices) => prices.get(symbol)));
  }

  /**
   * Start simulated price update stream
   * Generates mock price fluctuations every 5 seconds
   * @private
   */
  private startMockPriceStream(): void {
    // Simulate real-time price updates every 5 seconds
    interval(5000).subscribe(() => {
      const updates = new Map<string, number>();
      const symbols = [
        'BTC',
        'ETH',
        'XRP',
        'USDT',
        'BNB',
        'SOL',
        'USDC',
        'DOGE',
        'TRX',
        'ADA',
      ];

      symbols.forEach((symbol) => {
        // Simulate small price fluctuations (±0.5% of base price)
        const basePrice = this.getBasePrice(symbol);
        const fluctuation = (Math.random() - 0.5) * basePrice * 0.01;
        updates.set(symbol, basePrice + fluctuation);
      });

      this.priceUpdates.next(updates);
    });
  }

  /**
   * Get base price for mock data generation
   * Returns approximate real-world prices for simulation
   * @param symbol Cryptocurrency symbol
   * @returns Base price for the symbol
   * @private
   */
  private getBasePrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      BTC: 122234,
      ETH: 4532,
      XRP: 3.06,
      USDT: 1.0,
      BNB: 1160,
      SOL: 234,
      USDC: 1.0,
      DOGE: 0.26,
      TRX: 0.34,
      ADA: 0.87,
    };
    return basePrices[symbol] || 0;
  }

  /**
   * Connect to WebSocket for real price feeds
   * Placeholder for production implementation
   *
   * @param url WebSocket URL for price feed
   * @todo Implement actual WebSocket connection and message handling
   */
  connectWebSocket(url: string): void {
    // In production, implement WebSocket connection:
    // const ws = new WebSocket(url);
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   // Update priceUpdates BehaviorSubject with real data
    // };
    // ws.onerror = (error) => console.error('WebSocket error:', error);
    // ws.onclose = () => console.log('WebSocket closed');
  }
}
