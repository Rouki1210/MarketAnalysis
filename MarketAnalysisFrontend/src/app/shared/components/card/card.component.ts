import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * CardComponent
 *
 * Reusable card container with consistent styling
 *
 * Features:
 * - Optional padding (default: enabled)
 * - Custom CSS classes support
 * - Dark mode compatible
 * - Uses content projection for flexible content
 *
 * Usage:
 * ```html
 * <app-card>Your content here</app-card>
 * <app-card [padding]="false" customClass="my-custom-class">No padding</app-card>
 * ```
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {
  /** Enable/disable padding (default: true) */
  @Input() padding = true;

  /** Additional custom CSS classes */
  @Input() customClass = '';

  /** Computed CSS classes for card */
  get cardClasses(): string {
    const baseClasses = 'bg-card border border-border rounded-lg';
    const paddingClass = this.padding ? 'p-6' : '';
    return `${baseClasses} ${paddingClass} ${this.customClass}`;
  }
}
