import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private priceUpdates = new BehaviorSubject<Map<string, number>>(new Map());

  constructor() {
    this.startMockPriceStream();
  }

  getPriceUpdates(): Observable<Map<string, number>> {
    return this.priceUpdates.asObservable();
  }

  getPriceForSymbol(symbol: string): Observable<number | undefined> {
    return this.priceUpdates.pipe(
      map(prices => prices.get(symbol))
    );
  }

  private startMockPriceStream(): void {
    // Simulate real-time price updates every 5 seconds
    interval(5000).subscribe(() => {
      const updates = new Map<string, number>();
      const symbols = ['BTC', 'ETH', 'XRP', 'USDT', 'BNB', 'SOL', 'USDC', 'DOGE', 'TRX', 'ADA'];
      
      symbols.forEach(symbol => {
        // Simulate small price fluctuations
        const basePrice = this.getBasePrice(symbol);
        const fluctuation = (Math.random() - 0.5) * basePrice * 0.01; // ±0.5% fluctuation
        updates.set(symbol, basePrice + fluctuation);
      });

      this.priceUpdates.next(updates);
    });
  }

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
      ADA: 0.87
    };
    return basePrices[symbol] || 0;
  }

  // WebSocket connection for real APIs (placeholder)
  connectWebSocket(url: string): void {
    // In production, implement WebSocket connection
    // const ws = new WebSocket(url);
    // ws.onmessage = (event) => { ... }
  }
}

