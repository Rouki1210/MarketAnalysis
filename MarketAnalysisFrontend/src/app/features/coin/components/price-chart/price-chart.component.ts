import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ApiService } from '../../../../core/services/api.service';
import { ChartData, ChartTimeframe } from '../../../../core/models/common.model';

@Component({
  selector: 'app-price-chart',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  templateUrl: './price-chart.component.html',
  styleUrls: ['./price-chart.component.css']
})
export class PriceChartComponent implements OnInit {
  @Input() symbol!: string;

  chartData: ChartData[] = [];
  selectedTimeframe: ChartTimeframe = '1D';
  timeframes: ChartTimeframe[] = ['1D', '7D', '1M', '3M', '1Y', 'ALL', 'LOG'];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadChartData();
  }

  loadChartData(): void {
    this.apiService.getChartData(this.symbol, this.selectedTimeframe).subscribe(data => {
      this.chartData = data;
    });
  }

  selectTimeframe(timeframe: ChartTimeframe): void {
    this.selectedTimeframe = timeframe;
    this.loadChartData();
  }

  // Simple SVG chart rendering
  get chartPoints(): string {
    if (!this.chartData.length) return '';

    const width = 800;
    const height = 300;
    const padding = 40;

    const prices = this.chartData.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const points = this.chartData.map((data, index) => {
      const x = padding + (index / (this.chartData.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((data.price - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    return points.join(' ');
  }
}

