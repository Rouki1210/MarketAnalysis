import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SparklineComponent } from '../../shared/components/sparkline/sparkline.component';
import { GaugeComponent } from '../../shared/components/gauge/gauge.component';
import { ApiService } from '../../core/services/api.service';
import { MarketOverview as GlobalMarketOverview } from '../../core/models/market.model';
import { CompactNumberPipe } from '../../shared/pipes/compact-number.pipe';

@Component({
  selector: 'app-topbar-market-strip',
  standalone: true,
  imports: [CommonModule, SparklineComponent, GaugeComponent, CompactNumberPipe],
  templateUrl: './topbar-market-strip.component.html',
  styleUrls: ['./topbar-market-strip.component.css']
})
export class TopbarMarketStripComponent implements OnInit {

  constructor(private apiService: ApiService) { }
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
    // Generate sparkline data similar to the image pattern
    this.marketCapSparkline = this.generateMarketCapPattern();
    this.volumeSparkline = this.generateVolumePattern();
    this.btcDominanceSparkline = this.generateDominancePattern();
    this.ethDominanceSparkline = this.generateDominancePattern();

    this.loadMetricData();
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

  private generateMarketCapPattern(): number[] {
    // Pattern similar to the image: relatively flat with a dip in the middle
    const data: number[] = [];
    const points = 50;
    
    for (let i = 0; i < points; i++) {
      const position = i / points;
      let value = 60;
      
      // Create a dip in the middle (around 0.3-0.5)
      if (position > 0.3 && position < 0.5) {
        value = 60 - (Math.sin((position - 0.3) / 0.2 * Math.PI) * 20);
      }
      
      // Add some noise
      value += (Math.random() - 0.5) * 3;
      
      data.push(value);
    }
    
    return data;
  }

  private generateVolumePattern(): number[] {
    const data: number[] = [];
    const points = 50;
    
    for (let i = 0; i < points; i++) {
      const position = i / points;
      let value = 55;
      
      // Create a gentle wave
      value += Math.sin(position * Math.PI * 2) * 8;
      
      // Add noise
      value += (Math.random() - 0.5) * 4;
      
      data.push(value);
    }
    
    return data;
  }

  private generateDominancePattern(): number[] {
    const data: number[] = [];
    const points = 50;
    
    for (let i = 0; i < points; i++) {
      const position = i / points;
      let value = 50;
      
      // Slight upward trend
      value += position * 10;
      
      // Add wave pattern
      value += Math.sin(position * Math.PI * 3) * 5;
      
      // Add noise
      value += (Math.random() - 0.5) * 3;
      
      data.push(value);
    }
    
    return data;
  }
}

