import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Coin, CoinDetail } from '../models/coin.model';
import { Market, MarketOverview } from '../models/market.model';
import { ChartData } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = 'https://api.coincap.io/v2'; // Placeholder API

  constructor(private http: HttpClient) {}

  // Mock data for development
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
      },
      {
        rank: 3,
        name: "XRP",
        symbol: "XRP",
        price: "$3.06",
        change1h: "+0.65%",
        change24h: "+2.56%",
        change7d: "+11.97%",
        marketCap: "$183,482,317,122",
        volume: "$7,525,359,406",
        supply: "59.87B XRP",
        isPositive1h: true,
        isPositive24h: true,
        isPositive7d: true,
        icon: "◊",
        network: "XRP",
        sparklineData: [2.75, 2.85, 2.90, 2.95, 3.00, 3.06]
      },
      {
        rank: 4,
        name: "Tether",
        symbol: "USDT",
        price: "$1.00",
        change1h: "+0.01%",
        change24h: "+0.00%",
        change7d: "+0.01%",
        marketCap: "$176,348,919,218",
        volume: "$156,974,737,304",
        supply: "176.24B USDT",
        isPositive1h: true,
        isPositive24h: true,
        isPositive7d: true,
        icon: "₮",
        network: "Ethereum",
        sparklineData: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
      },
      {
        rank: 5,
        name: "BNB",
        symbol: "BNB",
        price: "$1,160.22",
        change1h: "+1.62%",
        change24h: "+9.85%",
        change7d: "+23.05%",
        marketCap: "$161,486,412,832",
        volume: "$5,231,011,228",
        supply: "139.18M BNB",
        isPositive1h: true,
        isPositive24h: true,
        isPositive7d: true,
        icon: "◈",
        network: "BSC",
        sparklineData: [950, 1020, 1050, 1100, 1130, 1160]
      },
      {
        rank: 6,
        name: "Solana",
        symbol: "SOL",
        price: "$234.68",
        change1h: "+1.76%",
        change24h: "+3.33%",
        change7d: "+19.60%",
        marketCap: "$127,960,364,289",
        volume: "$8,972,935,402",
        supply: "545.23M SOL",
        isPositive1h: true,
        isPositive24h: true,
        isPositive7d: true,
        icon: "◎",
        network: "Solana",
        sparklineData: [195, 210, 215, 225, 230, 234]
      },
      {
        rank: 7,
        name: "USDC",
        symbol: "USDC",
        price: "$0.9998",
        change1h: "+0.00%",
        change24h: "+0.00%",
        change7d: "+0.00%",
        marketCap: "$74,584,965,087",
        volume: "$19,404,888,617",
        supply: "74.59B USDC",
        isPositive1h: true,
        isPositive24h: true,
        isPositive7d: true,
        icon: "$",
        network: "Base",
        sparklineData: [1.0, 0.9999, 1.0, 0.9998, 1.0, 0.9998]
      },
      {
        rank: 8,
        name: "Dogecoin",
        symbol: "DOGE",
        price: "$0.2607",
        change1h: "+1.29%",
        change24h: "+2.25%",
        change7d: "+14.67%",
        marketCap: "$39,422,571,022",
        volume: "$3,060,157,456",
        supply: "151.19B DOGE",
        isPositive1h: true,
        isPositive24h: true,
        isPositive7d: true,
        icon: "Ð",
        network: "Dogecoin",
        sparklineData: [0.23, 0.24, 0.245, 0.25, 0.255, 0.2607]
      },
      {
        rank: 9,
        name: "TRON",
        symbol: "TRX",
        price: "$0.3435",
        change1h: "+0.31%",
        change24h: "+0.38%",
        change7d: "+2.39%",
        marketCap: "$32,520,939,263",
        volume: "$706,136,611",
        supply: "94.66B TRX",
        isPositive1h: true,
        isPositive24h: true,
        isPositive7d: true,
        icon: "⊥",
        network: "TRON",
        sparklineData: [0.335, 0.338, 0.340, 0.341, 0.342, 0.3435]
      },
      {
        rank: 10,
        name: "Cardano",
        symbol: "ADA",
        price: "$0.8720",
        change1h: "+1.29%",
        change24h: "+2.24%",
        change7d: "+12.50%",
        marketCap: "$31,236,017,752",
        volume: "$1,260,474,932",
        supply: "35.81B ADA",
        isPositive1h: true,
        isPositive24h: true,
        isPositive7d: true,
        icon: "₳",
        network: "Cardano",
        sparklineData: [0.775, 0.800, 0.820, 0.845, 0.860, 0.872]
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

