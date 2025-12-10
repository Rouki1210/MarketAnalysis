import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SparklineComponent } from '../../shared/components/sparkline/sparkline.component';
import { GaugeComponent } from '../../shared/components/gauge/gauge.component';
import { ApiService } from '../../core/services/api.service';
import { ChartService } from '../../core/services/chart.service';
import { MarketOverview as GlobalMarketOverview } from '../../core/models/market.model';
import { CompactNumberPipe } from '../../shared/pipes/compact-number.pipe';
import { forkJoin } from 'rxjs';

/**
 * TopbarMarketStripComponent
 *
 * Horizontal market overview strip displayed at top of pages
 *
 * Shows real-time global cryptocurrency market metrics:
 * - Total Market Cap with 7-day sparkline
 * - 24h Trading Volume with sparkline
 * - Bitcoin Dominance % with sparkline
 * - Ethereum Dominance % with sparkline
 * - Fear & Greed Index gauge (0-100 scale)
 *
 * Data Sources:
 * - Real-time metrics via SignalR (ApiService.globalMetric$)
 * - Historical sparkline data (ChartService)
 *
 * Updates automatically via WebSocket connection
 * Hidden on /profile and /community routes (controlled by ShellComponent)
 */
@Component({
  selector: 'app-topbar-market-strip',
  standalone: true,
  imports: [
    CommonModule,
    SparklineComponent,
    GaugeComponent,
    CompactNumberPipe,
  ],
  templateUrl: './topbar-market-strip.component.html',
  styleUrls: ['./topbar-market-strip.component.css'],
})
export class TopbarMarketStripComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private chartService: ChartService
  ) {}

  // Sparkline data (7-day historical trends)
  marketCapSparkline: number[] = [];
  volumeSparkline: number[] = [];
  btcDominanceSparkline: number[] = [];
  ethDominanceSparkline: number[] = [];

  /** Current global market overview data */
  globalMarketOverview: GlobalMarketOverview[] = [];

  /** Loading state indicator */
  isLoading: boolean = true;

  // Fear & Greed Index data
  /** Current fear & greed value (0-100) */
  fearGreedValue: number = 28;

  /** Fear & greed text label (Fear/Greed/Extreme Fear/etc.) */
  fearGreedLabel: string = 'Fear';

  ngOnInit(): void {
    this.loadMetricData();
    this.loadSparklineData();
  }

  /**
   * Subscribe to real-time global market metrics
   * Updates data via SignalR WebSocket connection
   * @private
   */
  private loadMetricData() {
    this.apiService.startGlobalMetricSignalR();

    this.apiService.globalMetric$.subscribe({
      next: (data) => {
        if (!data) return;
        this.globalMarketOverview = [data];
        this.isLoading = false;

        // Update Fear & Greed gauge
        this.fearGreedValue = Number(data.fearGreedIndex);
        this.fearGreedLabel = data.fear_and_greed_text;
      },
      error: (err) => {
        console.error('Global metric subscription error:', err);
        this.isLoading = false;
      },
    });
  }

  /**
   * Load 7-day historical data for sparkline charts
   * Fetches market cap, volume, and dominance trends
   * @private
   */
  private loadSparklineData() {
    // Fetch 7 days of historical data for all metrics
    this.chartService.getGlobalMetricsHistory('7d').subscribe({
      next: (history) => {
        if (!history || history.length === 0) return;

        // Extract sparkline data arrays for each metric
        this.marketCapSparkline = history.map(
          (item) => item.total_market_cap_usd
        );
        this.volumeSparkline = history.map((item) => item.total_volume_24h);
        this.btcDominanceSparkline = history.map(
          (item) => item.bitcoin_dominance_percentage
        );
        this.ethDominanceSparkline = history.map(
          (item) => item.ethereum_dominance_percentage
        );
      },
      error: (err) => {
        console.error('Failed to load sparkline data:', err);
        // Keep empty arrays if failed
      },
    });
  }
}
