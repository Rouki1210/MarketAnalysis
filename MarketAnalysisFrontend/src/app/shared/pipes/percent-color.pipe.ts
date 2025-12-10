import { Pipe, PipeTransform } from '@angular/core';

/**
 * PercentColorPipe
 *
 * Determines CSS color class based on percentage value (positive/negative)
 *
 * Usage: {{ percentValue | percentColor }}
 *  Or: {{ percentValue | percentColor:false }} // returns non-class strings
 *
 * Returns:
 * - Positive values: 'text-secondary' or 'secondary' (green)
 * - Negative values: 'text-accent' or 'accent' (red)
 * - Invalid values: 'text-muted-foreground' or 'muted' (gray)
 */
@Pipe({
  name: 'percentColor',
  standalone: true,
})
export class PercentColorPipe implements PipeTransform {
  /**
   * Transform percentage value to appropriate color class
   *
   * @param value Percentage value (string like "+5.2%" or number like 5.2)
   * @param returnClass If true, returns CSS class; if false, returns color name
   * @returns CSS class string or color name string
   */
  transform(value: string | number, returnClass: boolean = true): string {
    // Parse numeric value from string or number
    const numValue =
      typeof value === 'string'
        ? parseFloat(value.replace(/[^0-9.-]/g, ''))
        : value;

    // Handle invalid values
    if (isNaN(numValue)) return returnClass ? 'text-muted-foreground' : 'muted';

    // Return appropriate color class or name
    if (returnClass) {
      return numValue >= 0 ? 'text-secondary' : 'text-accent';
    } else {
      return numValue >= 0 ? 'secondary' : 'accent';
    }
  }
}
