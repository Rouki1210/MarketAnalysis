import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartService } from '../../../core/services/chart.service';

/**
 * SparklineComponent
 *
 * Mini inline chart showing price trend
 *
 * Features:
 * - Renders SVG polyline chart
 * - Can accept static data or fetch from API
 * - Color based on positive/negative trend
 * - Configurable dimensions
 * - Scales data to fit dimensions automatically
 *
 * Usage:
 * ```html
 * <!-- With static data -->
 * <app-sparkline [data]="[1,2,1.5,3,2.8]" [isPositive]="true"></app-sparkline>
 *
 * <!-- Fetch from API -->
 * <app-sparkline [symbol]="'btc'" [isPositive]="true"></app-sparkline>
 * ```
 */
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
  styles: [
    `
      .sparkline {
        display: block;
      }
    `,
  ],
})
export class SparklineComponent implements OnChanges, OnInit {
  /** Data points for the chart (if provided, skips API fetch) */
  @Input() data: number[] = [];

  /** Cryptocurrency symbol (if provided, fetches data from API) */
  @Input() symbol?: string;

  /** SVG width in pixels */
  @Input() width = 80;

  /** SVG height in pixels */
  @Input() height = 32;

  /** Determines line color (green for positive, red for negative) */
  @Input() isPositive = true;

  /** SVG polyline points string (calculated from data) */
  points = '';

  constructor(private chartService: ChartService) {}

  ngOnInit(): void {
    // Fetch sparkline data if symbol provided but no data
    if (this.symbol && (!this.data || this.data.length === 0)) {
      this.loadSparklineData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reload data when symbol changes
    if (changes['symbol'] && this.symbol && !changes['symbol'].firstChange) {
      this.loadSparklineData();
    }
    // Recalculate points when data changes
    else if (changes['data'] && this.data && this.data.length > 0) {
      this.calculatePoints();
    }
  }

  /** Line color based on positive/negative trend */
  get color(): string {
    return this.isPositive ? 'hsl(var(--secondary))' : 'hsl(var(--accent))';
  }

  /**
   * Fetch 7-day sparkline data from API
   * @private
   */
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
      },
    });
  }

  /**
   * Calculate SVG polyline points from data
   * Normalizes data to fit chart dimensions
   * @private
   */
  private calculatePoints(): void {
    if (!this.data || this.data.length === 0) {
      this.points = '';
      return;
    }

    // Find min/max for normalization
    const min = Math.min(...this.data);
    const max = Math.max(...this.data);
    const range = max - min || 1;

    // Convert each data point to SVG coordinates
    const points = this.data.map((value, index) => {
      const x = (index / (this.data.length - 1)) * this.width;
      const y = this.height - ((value - min) / range) * this.height;
      return `${x},${y}`;
    });

    this.points = points.join(' ');
  }
}
