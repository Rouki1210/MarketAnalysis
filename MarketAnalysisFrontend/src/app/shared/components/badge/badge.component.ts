import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Badge style variants */
export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning';

/**
 * BadgeComponent
 *
 * Small colored label for status indicators and tags
 *
 * Variants:
 * - default: Primary brand color
 * - secondary: Green (success/positive)
 * - success: Green (same as secondary)
 * - danger: Red (error/negative)
 * - warning: Yellow (caution)
 *
 * Usage:
 * ```html
 * <app-badge variant="success">Active</app-badge>
 * <app-badge variant="danger">Error</app-badge>
 * ```
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses">
      <ng-content></ng-content>
    </span>
  `,
})
export class BadgeComponent {
  /** Badge color variant */
  @Input() variant: BadgeVariant = 'default';

  /** Computed CSS classes based on variant */
  get badgeClasses(): string {
    const baseClasses =
      'inline-flex items-center px-2 py-1 rounded text-xs font-medium';

    const variantClasses: Record<BadgeVariant, string> = {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary/20 text-secondary',
      success: 'bg-secondary/20 text-secondary',
      danger: 'bg-accent/20 text-accent',
      warning: 'bg-yellow-500/20 text-yellow-500',
    };

    return `${baseClasses} ${variantClasses[this.variant]}`;
  }
}
