import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartService } from '../../../core/services/chart.service';

@Component({
  selector: 'app-sparkline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [attr.width]="width" [attr.height]="height" class="sparkline">
      <polyline 
        *ngIf="points"
        [attr.points]="points"
        [attr.stroke]="color"
        stroke-width="2"
        fill="none"
      />
    </svg>
  `,
  styles: [`
    .sparkline {
      display: block;
    }
  `]
})
export class SparklineComponent implements OnChanges, OnInit {
  @Input() data: number[] = [];
  @Input() symbol?: string; // If provided, will fetch real data
  @Input() width = 80;
  @Input() height = 32;
  @Input() isPositive = true;

  points = '';

  constructor(private chartService: ChartService) {}

  ngOnInit(): void {
    if (this.symbol && (!this.data || this.data.length === 0)) {
      this.loadSparklineData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['symbol'] && this.symbol && !changes['symbol'].firstChange) {
      this.loadSparklineData();
    } else if (changes['data'] && this.data && this.data.length > 0) {
      this.calculatePoints();
    }
  }

  get color(): string {
    return this.isPositive ? 'hsl(var(--secondary))' : 'hsl(var(--accent))';
  }

  private loadSparklineData(): void {
    if (!this.symbol) return;

    this.chartService.getSparklineData(this.symbol, 7).subscribe({
      next: (data) => {
        this.data = data;
        this.calculatePoints();
      },
      error: (err) => {
        console.error(`Error loading sparkline data for ${this.symbol}:`, err);
        // Use empty data on error
        this.data = [];
        this.points = '';
      }
    });
  }

  private calculatePoints(): void {
    if (!this.data || this.data.length === 0) {
      this.points = '';
      return;
    }

    const min = Math.min(...this.data);
    const max = Math.max(...this.data);
    const range = max - min || 1;

    const points = this.data.map((value, index) => {
      const x = (index / (this.data.length - 1)) * this.width;
      const y = this.height - ((value - min) / range) * this.height;
      return `${x},${y}`;
    });

    this.points = points.join(' ');
  }
}

