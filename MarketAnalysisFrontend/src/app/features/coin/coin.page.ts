import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CoinDetail } from '../../core/models/coin.model';
import { Market } from '../../core/models/market.model';
import { CoinStatsComponent } from './components/coin-stats/coin-stats.component';
import { PriceChartComponent } from './components/price-chart/price-chart.component';

@Component({
  selector: 'app-coin',
  standalone: true,
  imports: [CommonModule, CoinStatsComponent, PriceChartComponent],
  templateUrl: './coin.page.html',
  styleUrls: ['./coin.page.css'],
})
export class CoinPage implements OnInit {
  coinDetail?: CoinDetail;
  markets: Market[] = [];
  selectedTab = 'Chart';
  tabs = ['Chart', 'Markets', 'News', 'Yield', 'Market Cycles', 'About'];
  isLoading = true;

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const symbol = params['symbol']?.toUpperCase();
      if (symbol) {
        this.loadCoinData(symbol);
        this.subscribeToRealtimeUpdates(symbol);
      }
    });
  }

  loadCoinData(symbol: string): void {
    this.isLoading = true;

    this.apiService.getCoinBySymbol(symbol).subscribe({
      next: (detail) => {
        this.coinDetail = detail;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading coin details:', err);
        this.isLoading = false;
      },
    });

    this.apiService.getMarketPairs(symbol).subscribe({
      next: (markets) => {
        this.markets = markets;
      },
      error: (err) => {
        console.error('Error loading market pairs:', err);
      },
    });
  }

  subscribeToRealtimeUpdates(symbol: string): void {
    // Subscribe to realtime coin updates from SignalR
    this.apiService.coins$.subscribe((coins) => {
      const updatedCoin = coins.find((c) => c.symbol === symbol);
      if (updatedCoin && this.coinDetail) {
        // Update coin detail with realtime data
        this.coinDetail = {
          ...this.coinDetail,
          coin: updatedCoin,
          stats: {
            ...this.coinDetail.stats,
            marketCap: {
              value:
                updatedCoin.marketCap ?? this.coinDetail.stats.marketCap.value,
              change:
                updatedCoin.change24h ?? this.coinDetail.stats.marketCap.change,
              isPositive: updatedCoin.isPositive24h,
            },
            volume24h: {
              value:
                updatedCoin.volume ?? this.coinDetail.stats.volume24h.value,
              change:
                updatedCoin.change24h ?? this.coinDetail.stats.volume24h.change,
              isPositive: updatedCoin.isPositive24h,
            },
          },
        };
      }
    });
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }
}
