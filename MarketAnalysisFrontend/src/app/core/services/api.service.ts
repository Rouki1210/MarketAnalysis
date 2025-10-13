import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { Coin, CoinDetail } from '../models/coin.model';
import { Market, MarketOverview } from '../models/market.model';
import { ChartData } from '../models/common.model';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = 'http://localhost:5071'; // Placeholder API

  private hubConnection!: signalR.HubConnection;
  private coinsSource = new BehaviorSubject<Coin[]>([]);
  public coins$ = this.coinsSource.asObservable();
  private realtimeData: Record<string, any> = {};

  constructor(private http: HttpClient) {}

  getCoins(): Observable<Coin[]> {
    this.http.get<any[]>(`${this.apiUrl}/api/Asset`).subscribe({
      next: (assets) => {
        const coins: Coin[] = assets.map(a => ({
          id: a.id,
          name: a.name,
          symbol: a.symbol,
          description: a.description,
          price: "0",
          change1h: "0",
          change7d: "0",
          change24h: "0",
          marketCap: "0",
          volume: "0",
          supply: "0",
          rank: a.rank,
          isPositive1h: true,
          isPositive24h: true,
          isPositive7d: true,
          icon: 'Icon',
          network: 'Unknown',
          sparklineData: []
        }));

        this.coinsSource.next(coins);
        this.startSignalR(coins.map(c => c.symbol));
      },
      error: (err) => console.error('❌ Error loading assets:', err)
    });

    return this.coins$;
  }

  // SignalR connection for real-time updates (not fully implemented)

  startSignalR(symbols: string[]){
    if (this.hubConnection) return;

  this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${this.apiUrl}/pricehub`)
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .build();

  this.hubConnection
    .start()
    .then(async() => {
      console.log('✅ SignalR Connected');
      for (const symbol of symbols) {
        await this.hubConnection.invoke('JoinAssetGroup', symbol);
      }
    })
    .catch((err) => console.error('❌ SignalR Error:', err));

  this.hubConnection.on('ReceiveMessage', (message: any) => {
      const data = message.data;
      if (!data || !data.asset) return;

      console.log('📡 Realtime update:', data);
      this.realtimeData[data.asset] = data;   
      this.updateCoinRealTime(data);
    });
  }

  private updateCoinRealTime(update: any) {
    const coins = this.coinsSource.value;
    const index = coins.findIndex(c => c.symbol === update.asset.toUpperCase());
    if (index === -1) return;

    const coin = coins[index];
    const oldPrice = parseFloat(coin.price?.replace(/[^0-9.-]+/g, '') || '0');
    const newPrice = update.price;

    // Format helper
    const formatNumber = (num: number, digits: number = 2) =>
      num?.toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
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

    // ✅ Set highlight class based on price change
    const isPriceUp = newPrice > oldPrice;
    coins[index].highlightClass = isPriceUp ? 'flash-green' : 'flash-red';
    
    // ✅ Remove highlight after animation
    setTimeout(() => {
      coins[index].highlightClass = '';
      this.coinsSource.next([...coins]);
    }, 1500);

    this.coinsSource.next([...coins]);
  }

  loadCoins(): void {
    this.getCoins().subscribe(coins => {
      this.coinsSource.next(coins);
      console.log('💾 Loaded assets:', coins);

      // Auto join tất cả coin có trong DB
      coins.forEach(c => {
        if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
          this.hubConnection.invoke('JoinAssetGroup', c.symbol);
        }
      });
    });
  }

  private getMockCoins(): Coin[] {
    return [
      {
        id: "1",
        rank: "1",
        name: "Bitcoin",
        symbol: "BTC",
        price: "$122,234.07",
        change1h: "+1.04%",
        change24h: "+1.89%",
        change7d: "+12.07%",
        marketCap: "$2,435,905,446,491",
        volume: "$64,672,428,314",
        supply: "19.92M BTC",
        isPositive1h: true,
        isPositive24h: true,
        isPositive7d: true,
        icon: "₿",
        network: "Bitcoin",
        sparklineData: [111000, 112500, 111800, 113200, 112100, 122234]
      },
      {
        id: "2",
        rank: "2",
        name: "Ethereum",
        symbol: "ETH",
        price: "$4,532.81",
        change1h: "+1.07%",
        change24h: "+2.07%",
        change7d: "+14.81%",
        marketCap: "$547,125,800,865",
        volume: "$45,188,465,505",
        supply: "120.7M ETH",
        isPositive1h: true,
        isPositive24h: true,
        isPositive7d: true,
        icon: "Ξ",
        network: "Ethereum",
        sparklineData: [4200, 4350, 4280, 4450, 4380, 4532]
      }
    ];
  }

  getCoinBySymbol(symbol: string): Observable<CoinDetail> {
    const coins = this.getMockCoins();
    const coin = coins.find(c => c.symbol === symbol);
    
    if (!coin) {
      throw new Error('Coin not found');
    }

    const detail: CoinDetail = {
      coin,
      stats: {
        marketCap: { value: coin.marketCap ?? "", change: coin.change24h, isPositive: coin.isPositive24h },
        volume24h: { value: coin.volume ?? "", change: "+7.94%", isPositive: true },
        volumeMarketCapRatio: "2.03%",
        maxSupply: "21M BTC",
        circulatingSupply: coin.supply ?? "",
        totalSupply: coin.supply ?? "",
      },
      links: {
        website: "https://bitcoin.org",
        whitepaper: "https://bitcoin.org/bitcoin.pdf"
      }
    };

    return of(detail);
  }

  getMarketPairs(symbol: string): Observable<Market[]> {
    const mockMarkets: Market[] = [
      {
        exchange: "Binance",
        pair: `${symbol}/USDT`,
        price: "$122,234.55",
        volume: "$1,639,495,106",
        confidence: "High",
        updated: "Recently"
      },
      {
        exchange: "Binance",
        pair: `${symbol}/FDUSD`,
        price: "$122,236.71",
        volume: "$2,492,410,294",
        confidence: "High",
        updated: "Recently"
      },
      {
        exchange: "Bybit",
        pair: `${symbol}/USDT`,
        price: "$122,129.89",
        volume: "$894,860,976",
        confidence: "High",
        updated: "Recently"
      },
      {
        exchange: "Coinbase Exchange",
        pair: `${symbol}/USD`,
        price: "$122,189.11",
        volume: "$507,210,084",
        confidence: "High",
        updated: "Recently"
      }
    ];

    return of(mockMarkets);
  }

  getChartData(symbol: string, timeframe: string): Observable<ChartData[]> {
    const mockChartData: ChartData[] = [
      { time: "00:00", price: 111000 },
      { time: "04:00", price: 112500 },
      { time: "08:00", price: 111800 },
      { time: "12:00", price: 113200 },
      { time: "16:00", price: 112100 },
      { time: "20:00", price: 122234 }
    ];

    return of(mockChartData);
  }

  getMarketOverview(): Observable<MarketOverview> {
    const overview: MarketOverview = {
      totalMarketCap: "$4.2T",
      totalVolume24h: "$194.88B",
      btcDominance: "58.0%",
      ethDominance: "13.0%",
      fearGreedIndex: 57,
      altcoinSeasonIndex: 60
    };

    return of(overview);
  }
}

