import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CoinDetail } from '../../core/models/coin.model';
import { Market } from '../../core/models/market.model';
import { CoinStatsComponent } from './components/coin-stats/coin-stats.component';
import { PriceChartComponent } from './components/price-chart/price-chart.component';
import { AiAnalysisComponent } from './components/ai-analysis/ai-analysis.component';

/**
 * CoinPage
 *
 * Detailed view page for individual cryptocurrency
 *
 * Features:
 * - Comprehensive coin statistics and market metrics
 * - Interactive price charts (candlestick and line)
 * - AI-powered analysis and insights
 * - Multiple tabs for different data views (Chart, Markets, News, etc.)
 * - Real-time price updates via SignalR
 * - Market pairs trading information
 *
 * The page subscribes to real-time coin updates and automatically
 * refreshes displayed data when price changes occur.
 */
@Component({
  selector: 'app-coin',
  standalone: true,
  imports: [
    CommonModule,
    CoinStatsComponent,
    PriceChartComponent,
    AiAnalysisComponent,
  ],
  templateUrl: './coin.page.html',
  styleUrls: ['./coin.page.css'],
})
export class CoinPage implements OnInit {
  /** Full coin detail including stats and metadata */
  coinDetail?: CoinDetail;

  /** Trading pairs across different exchanges */
  markets: Market[] = [];

  /** Currently selected tab */
  selectedTab = 'Chart';

  /** Available tabs for different views */
  tabs = ['Chart', 'Markets', 'News', 'Yield', 'Market Cycles', 'About'];

  /** Loading state indicator */
  isLoading = true;

  /** Controls AI modal visibility */
  showAiModal = false;

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  /**
   * Initialize component and load coin data based on route parameter
   */
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const symbol = params['symbol']?.toUpperCase();
      if (symbol) {
        this.loadCoinData(symbol);
        this.subscribeToRealtimeUpdates(symbol);
      }
    });
  }

  /**
   * Load comprehensive coin data including details and market pairs
   *
   * Fetches:
   * - Coin detail (stats, about, contracts, links)
   * - Market pairs (trading information across exchanges)
   *
   * @param symbol Cryptocurrency symbol (e.g., 'BTC', 'ETH')
   */
  loadCoinData(symbol: string): void {
    this.isLoading = true;

    // Fetch coin details
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

    // Fetch market pairs
    this.apiService.getMarketPairs(symbol).subscribe({
      next: (markets) => {
        this.markets = markets;
      },
      error: (err) => {
        console.error('Error loading market pairs:', err);
      },
    });
  }

  /**
   * Subscribe to real-time coin updates from SignalR
   *
   * Updates displayed data when price changes occur including:
   * - Current price
   * - Market cap and 24h change
   * - Volume and 24h change
   * - Price trend indicators
   *
   * @param symbol Cryptocurrency symbol to monitor
   */
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

  /**
   * Switch between different information tabs
   * @param tab Tab name to display
   */
  selectTab(tab: string): void {
    this.selectedTab = tab;
  }
}
