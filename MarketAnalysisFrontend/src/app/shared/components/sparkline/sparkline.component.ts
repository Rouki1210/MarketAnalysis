import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sparkline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [attr.width]="width" [attr.height]="height" class="sparkline">
      <polyline 
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
export class SparklineComponent implements OnChanges {
  @Input() data: number[] = [];
  @Input() width = 80;
  @Input() height = 32;
  @Input() isPositive = true;

  points = '';

  get color(): string {
    return this.isPositive ? 'hsl(var(--secondary))' : 'hsl(var(--accent))';
  }

  ngOnChanges(): void {
    this.calculatePoints();
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

