import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * SkeletonComponent
 *
 * Loading placeholder with pulsing animation
 * Used during data fetching to improve perceived performance
 *
 * Features:
 * - Customizable width and height
 * - Rectangle or circle shapes
 * - Smooth pulsing animation
 *
 * Usage:
 * ```html
 * <app-skeleton [width]="200" [height]="20"></app-skeleton>
 * <app-skeleton [width]="40" [height]="40" [circle]="true"></app-skeleton>
 * ```
 */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="skeletonClasses"
      [style.width.px]="width"
      [style.height.px]="height"
    ></div>
  `,
  styles: [
    `
      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    `,
  ],
})
export class SkeletonComponent {
  /** Width in pixels (optional - will auto-fit if not provided) */
  @Input() width?: number;

  /** Height in pixels (default: 20) */
  @Input() height = 20;

  /** Use circle shape instead of rectangle */
  @Input() circle = false;

  /** Computed CSS classes for skeleton shape and animation */
  get skeletonClasses(): string {
    const baseClasses = 'bg-muted animate-pulse';
    const shapeClass = this.circle ? 'rounded-full' : 'rounded';
    return `${baseClasses} ${shapeClass}`;
  }
}
