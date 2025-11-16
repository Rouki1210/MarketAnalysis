import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SparklineComponent } from '../../shared/components/sparkline/sparkline.component';
import { GaugeComponent } from '../../shared/components/gauge/gauge.component';
import { ApiService } from '../../core/services/api.service';
import { ChartService } from '../../core/services/chart.service';
import { MarketOverview as GlobalMarketOverview } from '../../core/models/market.model';
import { CompactNumberPipe } from '../../shared/pipes/compact-number.pipe';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-topbar-market-strip',
  standalone: true,
  imports: [CommonModule, SparklineComponent, GaugeComponent, CompactNumberPipe],
  templateUrl: './topbar-market-strip.component.html',
  styleUrls: ['./topbar-market-strip.component.css']
})
export class TopbarMarketStripComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private chartService: ChartService
  ) { }
  
  // Sparkline data
  marketCapSparkline: number[] = [];
  volumeSparkline: number[] = [];
  btcDominanceSparkline: number[] = [];
  ethDominanceSparkline: number[] = [];
  globalMarketOverview: GlobalMarketOverview[] = [];
  isLoading: boolean = true;

  // Fear & Greed data
  fearGreedValue: number = 28;
  fearGreedLabel: string = 'Fear';

  ngOnInit(): void {
    this.loadMetricData();
    this.loadSparklineData();
  }

  private loadMetricData() {
    this.apiService.startGlobalMetricSignalR();

    this.apiService.globalMetric$.subscribe({
      next: (data) => {
        if (!data) return;
        this.globalMarketOverview = [data];
        this.isLoading = false;

        // Fear & Greed gauge update
        this.fearGreedValue = Number(data.fearGreedIndex);
        this.fearGreedLabel = data.fear_and_greed_text;
      },
      error: (err) => {
        console.error('Global metric subscription error:', err);
        this.isLoading = false;
      }
    });
  }

  private loadSparklineData() {
    // Fetch 7 days of historical data for all metrics
    this.chartService.getGlobalMetricsHistory('7d').subscribe({
      next: (history) => {
        if (!history || history.length === 0) return;

        // Extract sparkline data for each metric
        this.marketCapSparkline = history.map(item => item.total_market_cap_usd);
        this.volumeSparkline = history.map(item => item.total_volume_24h);
        this.btcDominanceSparkline = history.map(item => item.bitcoin_dominance_percentage);
        this.ethDominanceSparkline = history.map(item => item.ethereum_dominance_percentage);
      },
      error: (err) => {
        console.error('Failed to load sparkline data:', err);
        // Keep empty arrays if failed
      }
    });
  }
}

