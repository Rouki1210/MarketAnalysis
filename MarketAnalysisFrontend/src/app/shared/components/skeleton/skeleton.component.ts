import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="skeletonClasses" [style.width.px]="width" [style.height.px]="height"></div>
  `,
  styles: [`
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class SkeletonComponent {
  @Input() width?: number;
  @Input() height = 20;
  @Input() circle = false;

  get skeletonClasses(): string {
    const baseClasses = 'bg-muted animate-pulse';
    const shapeClass = this.circle ? 'rounded-full' : 'rounded';
    return `${baseClasses} ${shapeClass}`;
  }
}

