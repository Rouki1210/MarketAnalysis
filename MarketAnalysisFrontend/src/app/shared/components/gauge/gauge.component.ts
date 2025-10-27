import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gauge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gauge-container">
      <svg [attr.width]="size" [attr.height]="size * 0.6" class="gauge-svg">
        <!-- Colored segments -->
        <path
          *ngFor="let segment of segments"
          [attr.d]="segment.path"
          [attr.stroke]="segment.color"
          [attr.stroke-width]="strokeWidth"
          fill="none"
          stroke-linecap="round"
        />

        <!-- White pointer circle -->
        <circle
          [attr.cx]="pointerPosition.x"
          [attr.cy]="pointerPosition.y"
          [attr.r]="strokeWidth * 0.6"
          fill="white"
          [attr.stroke]="'hsl(var(--background))'"
          [attr.stroke-width]="2"
        />

        <!-- Value text -->
        <text
          [attr.x]="size / 2"
          [attr.y]="size * 0.45"
          text-anchor="middle"
          class="gauge-value"
          [style.font-size.px]="size * 0.25"
          fill="hsl(var(--foreground))"
          font-weight="bold"
        >
          {{ value }}
        </text>

        <!-- Label text -->
        <text
          [attr.x]="size / 2"
          [attr.y]="size * 0.55"
          text-anchor="middle"
          class="gauge-label"
          [style.font-size.px]="size * 0.08"
          fill="hsl(var(--muted-foreground))"
        >
          {{ label }}
        </text>
      </svg>
    </div>
  `,
  styles: [
    `
      .gauge-container {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .gauge-svg {
        display: block;
      }

      .gauge-value {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          sans-serif;
      }

      .gauge-label {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          sans-serif;
      }
    `,
  ],
})
export class GaugeComponent implements OnChanges {
  @Input() value: number = 0;
  @Input() label: string = '';
  @Input() size: number = 200;
  @Input() strokeWidth: number = 16;

  segments: { path: string; color: string }[] = [];
  pointerPosition: { x: number; y: number } = { x: 0, y: 0 };

  ngOnChanges(): void {
    this.calculatePaths();
    this.calculatePointerPosition();
  }

  private calculatePaths(): void {
    const centerX = this.size / 2;
    const centerY = this.size * 0.5;
    const radius = (this.size - this.strokeWidth) / 2.5;

    // Start angle: 180° (left), End angle: 0° (right)
    const startAngle = Math.PI;
    const endAngle = 0;
    const totalAngle = startAngle - endAngle;

    // Define 5 color segments based on Fear & Greed index
    // 0-20: Extreme Fear (Red)
    // 21-40: Fear (Orange)
    // 41-60: Neutral (Yellow)
    // 61-80: Greed (Light Green)
    // 81-100: Extreme Greed (Green)
    const segmentConfig = [
      { start: 0, end: 20, color: '#ea3943' }, // Red - Extreme Fear
      { start: 20, end: 40, color: '#f3a033' }, // Orange - Fear
      { start: 40, end: 60, color: '#f3d23e' }, // Yellow - Neutral
      { start: 60, end: 80, color: '#93d900' }, // Light Green - Greed
      { start: 80, end: 100, color: '#16c784' }, // Green - Extreme Greed
    ];

    this.segments = segmentConfig.map((config) => {
      const segmentStartAngle = startAngle - (config.start / 100) * totalAngle;
      const segmentEndAngle = startAngle - (config.end / 100) * totalAngle;

      return {
        path: this.describeArc(
          centerX,
          centerY,
          radius,
          segmentStartAngle,
          segmentEndAngle
        ),
        color: config.color,
      };
    });
  }

  private calculatePointerPosition(): void {
    const centerX = this.size / 2;
    const centerY = this.size * 0.5;
    const radius = (this.size - this.strokeWidth) / 2.5;

    // Calculate angle based on value (0-100)
    // Start angle: 180° (left), End angle: 0° (right)
    const startAngle = Math.PI;
    const endAngle = 0;
    const totalAngle = startAngle - endAngle;

    // Clamp value between 0 and 100
    const clampedValue = Math.max(0, Math.min(100, this.value));
    const valueAngle = startAngle - (clampedValue / 100) * totalAngle;

    // Calculate pointer position
    this.pointerPosition = this.polarToCartesian(
      centerX,
      centerY,
      radius,
      valueAngle
    );
  }

  private describeArc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ): string {
    const start = this.polarToCartesian(x, y, radius, startAngle);
    const end = this.polarToCartesian(x, y, radius, endAngle);

    const largeArcFlag = Math.abs(startAngle - endAngle) > Math.PI ? 1 : 0;
    const sweepFlag = startAngle > endAngle ? 1 : 0;

    return [
      'M',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      sweepFlag,
      end.x,
      end.y,
    ].join(' ');
  }

  private polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInRadians: number
  ) {
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY - radius * Math.sin(angleInRadians),
    };
  }
}
