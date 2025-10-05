import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { Coin, CoinDetail } from '../models/coin.model';
import { Market, MarketOverview } from '../models/market.model';
import { ChartData } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = 'https://localhost:7175'; // Placeholder API

  constructor(private http: HttpClient) {}

  // Mock data for development
  // getAssets(): Observable<Coin[]> {
  //   return this.http.get<Coin[]>(`${this.apiUrl}/api/assets`);
  // }


getPrices(): Observable<Coin[]> {
  return this.http.get<any[]>(`${this.apiUrl}/api/Prices`).pipe(
    map(coins => coins.map(c => {
      const formatNumber = (num: number, digits: number = 2) =>
        num?.toLocaleString(undefined, {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits
        }) ?? '0';

      const formatPercent = (val: number) => {
        const sign = val >= 0 ? '+' : '';
        return `${sign}${val.toFixed(2)}%`;
      };

      return {
        rank: Number(c.rank),
        name: c.name,
        symbol: c.symbol,
        price: `$${formatNumber(c.price)}`,
        change1h: formatPercent(c.percentChange1h),
        change24h: formatPercent(c.percentChange24h),
        change7d: formatPercent(c.percentChange7d),
        marketCap: `$${formatNumber(c.marketCap, 0)}`,
        volume: `$${formatNumber(c.volume, 0)}`,
        supply: `${formatNumber(c.supply, 0)} ${c.symbol}`,
        isPositive1h: c.percentChange1h >= 0,
        isPositive24h: c.percentChange24h >= 0,
        isPositive7d: c.percentChange7d >= 0,
        icon: c.symbol.charAt(0),
        network: c.source,
        sparklineData: []
      } as Coin;
    }))
  );
}


  private getMockCoins(): Coin[] {
    return [
      {
        rank: 1,
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
        rank: 2,
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

  getCoins(params?: any): Observable<Coin[]> {
    // In production, use: return this.http.get<Coin[]>(`${this.apiUrl}/assets`, { params });
    return of(this.getMockCoins());
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
        marketCap: { value: coin.marketCap, change: coin.change24h, isPositive: coin.isPositive24h },
        volume24h: { value: coin.volume, change: "+7.94%", isPositive: true },
        volumeMarketCapRatio: "2.03%",
        maxSupply: "21M BTC",
        circulatingSupply: coin.supply,
        totalSupply: coin.supply
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

