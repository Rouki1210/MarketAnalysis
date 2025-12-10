import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  Observable,
  of,
  forkJoin,
  map,
} from 'rxjs';
import { Coin, CoinDetail } from '../models/coin.model';
import { Market, MarketOverview } from '../models/market.model';
import * as signalR from '@microsoft/signalr';
import { AuthService } from './auth.service';

/**
 * ApiService
 *
 * Central service for managing cryptocurrency market data including:
 * - Fetching coin/asset information from backend API
 * - Real-time price updates via SignalR WebSocket connections
 * - Global market metrics and statistics
 * - Coin detail information with latest prices
 *
 * This service maintains observable streams that components can subscribe to
 * for reactive data updates.
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // Backend API base URL
  private readonly apiUrl = 'https://localhost:7175';

  // SignalR hub connections for real-time updates
  private hubConnection!: signalR.HubConnection;
  private globalMetricsHubConnection!: signalR.HubConnection;

  // Observable streams for reactive data
  private coinsSource = new BehaviorSubject<Coin[]>([]);
  private globalMetricSource = new BehaviorSubject<MarketOverview | null>(null);
  public globalMetric$ = this.globalMetricSource.asObservable();
  public coins$ = this.coinsSource.asObservable();

  // Cache for real-time data keyed by asset symbol
  private realtimeData: Record<string, any> = {};

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Fetch all available coins/assets from the backend
   * Initializes SignalR connection for real-time price updates
   * @returns Observable stream of coins array
   */
  getCoins(): Observable<Coin[]> {
    this.http.get<any[]>(`${this.apiUrl}/api/Asset`).subscribe({
      next: (assets) => {
        // Transform backend Asset objects to frontend Coin model
        const coins: Coin[] = assets.map((a) => ({
          id: a.id || a.symbol, // Use symbol as fallback if id is missing
          name: a.name,
          symbol: a.symbol,
          description: a.description,
          // Initial price data (will be updated by SignalR)
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
          viewCount: a.viewCount,
          dateAdd: a.dateAdd,
        }));

        this.coinsSource.next(coins);

        // Start real-time updates for all coins
        this.startSignalR(coins.map((c) => c.symbol));
      },
      error: (err) => console.error('❌ Error loading assets:', err),
    });

    return this.coins$;
  }

  // ==================== SignalR Real-Time Updates ====================

  /**
   * Initialize SignalR connection for real-time price updates
   * Sets up automatic reconnection and message handlers
   * @param symbols Array of coin symbols to track
   */
  startSignalR(symbols: string[]): void {
    // Don't create multiple connections
    if (this.hubConnection) return;

    // Configure SignalR hub connection
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}/pricehub`)
      .withAutomaticReconnect([0, 2000, 5000, 10000]) // Retry intervals in ms
      .build();

    // Establish connection
    this.hubConnection
      .start()
      .then(async () => {
        console.log('✅ SignalR PriceHub Connected');
      })
      .catch((err) => console.error('❌ SignalR PriceHub Error:', err));

    // Handle incoming price update messages
    this.hubConnection.on('ReceiveMessage', (message: any) => {
      const data = message.data;
      if (!data || !data.asset) return;

      // Cache the latest data
      this.realtimeData[data.asset] = data;

      // Update coin in the observable stream
      this.updateCoinRealTime(data);
    });
  }

  /**
   * Join SignalR groups to receive updates for specific assets
   * @param symbols Array of coin symbols to subscribe to
   */
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

  /**
   * Leave SignalR groups to stop receiving updates
   * @param symbols Array of coin symbols to unsubscribe from
   */
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

  /**
   * Update a coin's data in the observable stream with real-time data
   * Includes visual flash effect for price changes
   * @param update Real-time update data from SignalR
   * @private
   */
  private updateCoinRealTime(update: any): void {
    const coins = this.coinsSource.value;
    const index = coins.findIndex(
      (c) => c.symbol === update.asset.toUpperCase()
    );

    if (index === -1) return;

    const coin = coins[index];
    const oldPrice = parseFloat(coin.price?.replace(/[^0-9.-]+/g, '') || '0');
    const newPrice = update.price;

    // Number formatting helper functions
    const formatNumber = (num: number, digits: number = 2) =>
      num?.toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }) ?? '0';

    const formatPercent = (val: number) => {
      const sign = val >= 0 ? '+' : '';
      return `${sign}${val.toFixed(2)}%`;
    };

    // Update coin data with formatted values
    coin.price = `$${formatNumber(newPrice)}`;
    coin.change1h = formatPercent(update.change1h);
    coin.change24h = formatPercent(update.change24h);
    coin.change7d = formatPercent(update.change7d);
    coin.marketCap = `$${formatNumber(update.marketCap, 0)}`;
    coin.volume = `$${formatNumber(update.volume, 0)}`;
    coin.supply = `${formatNumber(update.supply, 0)} ${coin.symbol}`;

    // Update trend indicators
    coin.isPositive1h = Number(update.change1h) >= 0;
    coin.isPositive24h = Number(update.change24h) >= 0;
    coin.isPositive7d = Number(update.change7d) >= 0;

    // Add visual flash effect based on price movement
    const isPriceUp = newPrice > oldPrice;
    coins[index].highlightClass = isPriceUp ? 'flash-green' : 'flash-red';

    // Remove flash effect after animation completes
    setTimeout(() => {
      coins[index].highlightClass = '';
      this.coinsSource.next([...coins]);
    }, 1500);

    // Emit updated coins array
    this.coinsSource.next([...coins]);
  }

  /**
   * Load coins and join SignalR groups
   * Convenience method for initializing coin data with real-time updates
   */
  loadCoins(): void {
    this.getCoins().subscribe((coins) => {
      this.coinsSource.next(coins);

      // Subscribe to real-time updates for each coin
      coins.forEach((c) => {
        if (
          this.hubConnection?.state === signalR.HubConnectionState.Connected
        ) {
          this.hubConnection.invoke('JoinAssetGroup', c.symbol);
        }
      });
    });
  }

  // ==================== Coin Detail Information ====================

  /**
   * Fetch detailed information for a specific coin
   * Combines asset metadata with latest price data
   * @param symbol Coin symbol (e.g., 'BTC', 'ETH')
   * @returns Observable with complete coin detail information
   */
  getCoinBySymbol(symbol: string): Observable<CoinDetail> {
    // Fetch asset details and recent prices in parallel
    return forkJoin({
      asset: this.http.get<any>(`${this.apiUrl}/api/Asset/${symbol}`),
      // Get price history for the last 24 hours
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

        // Get the most recent price point
        const sortedPrices = prices.sort(
          (a, b) =>
            new Date(b.timestampUtc).getTime() -
            new Date(a.timestampUtc).getTime()
        );
        const latestPrice = sortedPrices.length > 0 ? sortedPrices[0] : null;

        // Extract numeric values from latest price data
        const price = latestPrice ? latestPrice.price : 0;
        const marketCap = latestPrice ? latestPrice.marketCap : 0;
        const volume = latestPrice ? latestPrice.volume : 0;
        const change1h = latestPrice ? latestPrice.percentChange1h : 0;
        const change24h = latestPrice ? latestPrice.percentChange24h : 0;
        const change7d = latestPrice ? latestPrice.percentChange7d : 0;
        const supply = latestPrice ? latestPrice.supply : 0;

        // Calculate volume/market cap ratio (indicator of trading activity)
        const volMktCapRatio =
          marketCap > 0 ? ((volume / marketCap) * 100).toFixed(2) : '0.00';

        // Number formatting helpers
        const formatNumber = (num: number, digits: number = 2) =>
          num?.toLocaleString(undefined, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
          }) ?? '0';

        const formatPercent = (val: number) => {
          const sign = val >= 0 ? '+' : '';
          return `${sign}${val.toFixed(2)}%`;
        };

        // Build Coin object
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
          sparklineData: [], // Can be fetched separately if needed
        };

        // Build detailed coin information
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
            website: 'https://bitcoin.org', // TODO: Get from backend
            whitepaper: 'https://bitcoin.org/bitcoin.pdf', // TODO: Get from backend
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

  /**
   * Get trading pairs for a specific coin
   * @param symbol Coin symbol
   * @returns Observable with array of market pairs
   * @todo Implement when backend endpoint is available
   */
  getMarketPairs(symbol: string): Observable<Market[]> {
    // Backend endpoint not yet implemented
    return of([]);
  }

  // ==================== Global Market Metrics ====================

  /**
   * Initialize SignalR connection for global market metrics
   * Receives real-time updates on total market cap, volume, dominance, etc.
   */
  startGlobalMetricSignalR(): void {
    // Don't create multiple connections
    if (this.globalMetricsHubConnection) return;

    // Configure SignalR hub connection
    this.globalMetricsHubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}/globalmetrichub`)
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    // Establish connection
    this.globalMetricsHubConnection
      .start()
      .then(() => {
        console.log('✅ Global Metrics SignalR Connected');
      })
      .catch((err) => console.error('❌ Global Metrics SignalR Error:', err));

    // Handle incoming global metric updates
    this.globalMetricsHubConnection.on(
      'ReceiveGlobalMetric',
      (message: any) => {
        const data = message.data;
        if (!data) return;

        // Number formatting helper
        const formatNumber = (num: number, digits: number = 0) =>
          num?.toLocaleString(undefined, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
          }) ?? '0';

        // Transform backend data to MarketOverview model
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

  /**
   * Get observable stream of global market metrics
   * Automatically starts SignalR connection if not already started
   * @returns Observable with market overview data
   */
  getMarketOverview(): Observable<MarketOverview | null> {
    this.startGlobalMetricSignalR();
    return this.globalMetric$;
  }
}
