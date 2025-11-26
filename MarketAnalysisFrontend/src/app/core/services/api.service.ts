import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  filter,
  first,
  map,
  Observable,
  of,
  switchMap,
  forkJoin,
} from 'rxjs';
import { Coin, CoinDetail } from '../models/coin.model';
import { Market, MarketOverview } from '../models/market.model';
import { ChartData } from '../models/common.model';
import * as signalR from '@microsoft/signalr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl = 'https://localhost:7175'; // Placeholder API

  private hubConnection!: signalR.HubConnection;
  private globalMetricsHubConnection!: signalR.HubConnection;
  private coinsSource = new BehaviorSubject<Coin[]>([]);
  private globalMetricSource = new BehaviorSubject<MarketOverview | null>(null);
  public globalMetric$ = this.globalMetricSource.asObservable();
  public coins$ = this.coinsSource.asObservable();
  private realtimeData: Record<string, any> = {};

  constructor(private http: HttpClient, private authService: AuthService) {}

  getCoins(): Observable<Coin[]> {
    this.http.get<any[]>(`${this.apiUrl}/api/Asset`).subscribe({
      next: (assets) => {
        const coins: Coin[] = assets.map((a) => ({
          id: a.id || a.symbol, // Use symbol as fallback if id is missing
          name: a.name,
          symbol: a.symbol,
          description: a.description,
          price: '0',
          change1h: '0',
          change7d: '0',
          change24h: '0',
          marketCap: '0',
          volume: '0',
          supply: '0',
          rank: a.rank,
          isPositive1h: true,
          isPositive24h: true,
          isPositive7d: true,
          icon: a.logoUrl,
          network: a.network,
          sparklineData: [],
        }));

        this.coinsSource.next(coins);
        this.startSignalR(coins.map((c) => c.symbol));
      },
      error: (err) => console.error('❌ Error loading assets:', err),
    });

    return this.coins$;
  }

  // SignalR connection for real-time updates (not fully implemented)

  startSignalR(symbols: string[]) {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}/pricehub`)
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    this.hubConnection
      .start()
      .then(async () => {
        console.log('✅ SignalR PriceHub Connected');
      })
      .catch((err) => console.error('❌ SignalR PriceHub Error:', err));

    this.hubConnection.on('ReceiveMessage', (message: any) => {
      const data = message.data;
      if (!data || !data.asset) return;

      this.realtimeData[data.asset] = data;
      this.updateCoinRealTime(data);
    });
  }

  async joinAssetGroup(symbols: string[]): Promise<void> {
    if (!this.hubConnection) return;

    for (const symbol of symbols) {
      try {
        await this.hubConnection.invoke('JoinAssetGroup', symbol);
      } catch (err) {
        console.error(`Failed to join group ${symbol}:`, err);
      }
    }
  }

  async leaveAssetGroups(symbols: string[]): Promise<void> {
    if (!this.hubConnection) return;

    for (const symbol of symbols) {
      try {
        await this.hubConnection.invoke('LeaveAssetGroup', symbol);
      } catch (err) {
        console.error(`Failed to leave group ${symbol}:`, err);
      }
    }
  }

  private updateCoinRealTime(update: any) {
    const coins = this.coinsSource.value;
    const index = coins.findIndex(
      (c) => c.symbol === update.asset.toUpperCase()
    );
    if (index === -1) return;

    const coin = coins[index];
    const oldPrice = parseFloat(coin.price?.replace(/[^0-9.-]+/g, '') || '0');
    const newPrice = update.price;

    // Format helper
    const formatNumber = (num: number, digits: number = 2) =>
      num?.toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }) ?? '0';

    const formatPercent = (val: number) => {
      const sign = val >= 0 ? '+' : '';
      return `${sign}${val.toFixed(2)}%`;
    };

    coin.price = `$${formatNumber(newPrice)}`;
    coin.change1h = formatPercent(update.change1h);
    coin.change24h = formatPercent(update.change24h);
    coin.change7d = formatPercent(update.change7d);
    coin.marketCap = `$${formatNumber(update.marketCap, 0)}`;
    coin.volume = `$${formatNumber(update.volume, 0)}`;
    coin.supply = `${formatNumber(update.supply, 0)} ${coin.symbol}`;

    coin.isPositive1h = Number(update.change1h) >= 0;
    coin.isPositive24h = Number(update.change24h) >= 0;
    coin.isPositive7d = Number(update.change7d) >= 0;

    // Set highlight class based on price change
    const isPriceUp = newPrice > oldPrice;
    coins[index].highlightClass = isPriceUp ? 'flash-green' : 'flash-red';

    // Remove highlight after animation
    setTimeout(() => {
      coins[index].highlightClass = '';
      this.coinsSource.next([...coins]);
    }, 1500);

    this.coinsSource.next([...coins]);
  }

  loadCoins(): void {
    this.getCoins().subscribe((coins) => {
      this.coinsSource.next(coins);

      coins.forEach((c) => {
        if (
          this.hubConnection?.state === signalR.HubConnectionState.Connected
        ) {
          this.hubConnection.invoke('JoinAssetGroup', c.symbol);
        }
      });
    });
  }

  getCoinBySymbol(symbol: string): Observable<CoinDetail> {
    // Fetch asset details and latest price in parallel
    return forkJoin({
      asset: this.http.get<any>(`${this.apiUrl}/api/Asset/${symbol}`),
      // Get price history for the last 24h to calculate changes if needed,
      // or just use the asset's price points if the backend returns them.
      // However, the backend Asset model has a PricePoints collection.
      // Let's assume the Asset endpoint returns the Asset object which might include PricePoints.
      // If not, we fetch prices separately.
      // Based on the plan, we call /api/Prices/{symbol}
      prices: this.http.get<any[]>(
        `${this.apiUrl}/api/Prices/${symbol}?from=${new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ).toISOString()}`
      ),
    }).pipe(
      map(({ asset, prices }) => {
        if (!asset) {
          throw new Error(`Coin with symbol ${symbol} not found`);
        }

        // Get latest price point
        // Sort prices by timestamp descending to get the latest
        const sortedPrices = prices.sort(
          (a, b) =>
            new Date(b.timestampUtc).getTime() -
            new Date(a.timestampUtc).getTime()
        );
        const latestPrice = sortedPrices.length > 0 ? sortedPrices[0] : null;

        // Helper function to parse numeric values from formatted strings
        const parseValue = (val: any): number => {
          if (typeof val === 'number') return val;
          if (!val) return 0;
          return parseFloat(val.toString().replace(/[$,]/g, ''));
        };

        const price = latestPrice ? latestPrice.price : 0;
        const marketCap = latestPrice ? latestPrice.marketCap : 0;
        const volume = latestPrice ? latestPrice.volume : 0;
        const change1h = latestPrice ? latestPrice.percentChange1h : 0;
        const change24h = latestPrice ? latestPrice.percentChange24h : 0;
        const change7d = latestPrice ? latestPrice.percentChange7d : 0;
        const supply = latestPrice ? latestPrice.supply : 0;

        // Calculate volume/market cap ratio
        const volMktCapRatio =
          marketCap > 0 ? ((volume / marketCap) * 100).toFixed(2) : '0.00';

        // Format helper
        const formatNumber = (num: number, digits: number = 2) =>
          num?.toLocaleString(undefined, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
          }) ?? '0';

        const formatPercent = (val: number) => {
          const sign = val >= 0 ? '+' : '';
          return `${sign}${val.toFixed(2)}%`;
        };

        const coin: Coin = {
          id: asset.id.toString(),
          name: asset.name,
          symbol: asset.symbol,
          description: asset.description,
          rank: asset.rank,
          price: `$${formatNumber(price)}`,
          change1h: formatPercent(change1h),
          change24h: formatPercent(change24h),
          change7d: formatPercent(change7d),
          marketCap: `$${formatNumber(marketCap, 0)}`,
          volume: `$${formatNumber(volume, 0)}`,
          supply: `${formatNumber(supply, 0)} ${asset.symbol}`,
          isPositive1h: change1h >= 0,
          isPositive24h: change24h >= 0,
          isPositive7d: change7d >= 0,
          icon: asset.logoUrl,
          network: asset.network,
          sparklineData: [], // Sparkline can be fetched separately if needed
        };

        const detail: CoinDetail = {
          coin: coin,
          stats: {
            marketCap: {
              value: coin.marketCap ?? '$0',
              change: coin.change24h ?? '+0%',
              isPositive: coin.isPositive24h,
            },
            volume24h: {
              value: coin.volume ?? '$0',
              change: coin.change24h ?? '+0%',
              isPositive: coin.isPositive24h,
            },
            volumeMarketCapRatio: `${volMktCapRatio}%`,
            maxSupply: coin.supply ?? '0',
            circulatingSupply: coin.supply ?? '0',
            totalSupply: coin.supply ?? '0',
          },
          links: {
            website: 'https://bitcoin.org', // Placeholder
            whitepaper: 'https://bitcoin.org/bitcoin.pdf', // Placeholder
          },
        };

        return detail;
      }),
      catchError((error) => {
        console.error('Error fetching coin details:', error);
        throw error;
      })
    );
  }

  getMarketPairs(symbol: string): Observable<Market[]> {
    // Backend doesn't have this endpoint yet, return empty array
    return of([]);
  }

  getChartData(symbol: string, timeframe: string): Observable<ChartData[]> {
    const mockChartData: ChartData[] = [
      { time: '00:00', price: 111000 },
      { time: '04:00', price: 112500 },
      { time: '08:00', price: 111800 },
      { time: '12:00', price: 113200 },
      { time: '16:00', price: 112100 },
      { time: '20:00', price: 122234 },
    ];

    return of(mockChartData);
  }

  startGlobalMetricSignalR() {
    // Placeholder for future implementation
    if (this.globalMetricsHubConnection) return;

    this.globalMetricsHubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}/globalmetrichub`)
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    this.globalMetricsHubConnection
      .start()
      .then(() => {
        console.log('✅ Global Metrics SignalR Connected');
      })
      .catch((err) => console.error('❌ Global Metrics SignalR Error:', err));

    this.globalMetricsHubConnection.on(
      'ReceiveGlobalMetric',
      (message: any) => {
        const data = message.data;
        if (!data) return;

        const formatNumber = (num: number, digits: number = 0) =>
          num?.toLocaleString(undefined, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
          }) ?? '0';

        const overview: MarketOverview = {
          totalMarketCap: `$${formatNumber(data.total_market_cap_usd, 0)}`,
          totalMarketCapChange24h: (
            data.total_market_cap_percent_change_24h / 100
          ).toString(),
          cmc20: '0',
          fearGreedIndex: data.fear_and_greed_index.toString(),
          fear_and_greed_text: data.fear_and_greed_text,
          totalVolume24h: `$${formatNumber(data.total_volume_24h, 0)}`,
          totalVolume24hChange: (
            data.total_volume_24h_percent_change_24h / 100
          ).toString(),
          btcDominance: (data.bitcoin_dominance_price / 100).toString(),
          ethDominance: (data.ethereum_dominance_price / 100).toString(),
          btcDominancePercent: (
            data.bitcoin_dominance_percentage / 100
          ).toString(),
          ethDominancePercent: (
            data.ethereum_dominance_percentage / 100
          ).toString(),
          altcoinSeasonIndex: data.altcoin_season_score,
        };
        this.globalMetricSource.next(overview);
      }
    );
  }

  getMarketOverview(): Observable<MarketOverview | null> {
    this.startGlobalMetricSignalR();
    return this.globalMetric$;
  }
}
