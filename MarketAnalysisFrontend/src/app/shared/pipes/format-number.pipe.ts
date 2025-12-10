import { Pipe, PipeTransform } from '@angular/core';

/**
 * FormatNumberPipe
 *
 * Formats numbers with thousand separators and decimal places
 *
 * Usage: {{ value | formatNumber }}
 *   Or: {{ value | formatNumber:4 }} // custom decimals
 *
 * Examples:
 * - 1234.5 => "1,234.50"
 * - 1000000 => "1,000,000.00"
 * - 123.456789, decimals:4 => "123.4568"
 */
@Pipe({
  name: 'formatNumber',
  standalone: true,
})
export class FormatNumberPipe implements PipeTransform {
  /**
   * Transform number to locale-formatted string with separators
   * @param value Number or string to format
   * @param decimals Number of decimal places (default: 2)
   * @returns Formatted number string
   */
  transform(value: number | string, decimals: number = 2): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return value.toString();

    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
}
