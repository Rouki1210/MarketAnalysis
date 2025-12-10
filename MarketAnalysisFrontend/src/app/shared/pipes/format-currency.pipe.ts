import { Pipe, PipeTransform } from '@angular/core';

/**
 * FormatCurrencyPipe
 *
 * Formats numbers as currency strings with K/M/B/T abbreviations
 *
 * Usage: {{ value | formatCurrency }}
 *
 * Examples:
 * - 1500 => $1.50K
 * - 2500000 => $2.50M
 * - 1200000000 => $1.20B
 * - 3400000000000 => $3.40T
 *
 * Note: If value is already a formatted string, returns it unchanged
 */
@Pipe({
  name: 'formatCurrency',
  standalone: true,
})
export class FormatCurrencyPipe implements PipeTransform {
  /**
   * Transform numeric value to formatted currency string
   * @param value Number or string to format
   * @returns Formatted currency string with abbreviation
   */
  transform(value: string | number): string {
    if (typeof value === 'string') {
      return value; // Already formatted
    }

    const num = Number(value);
    if (isNaN(num)) return value.toString();

    // Format based on magnitude
    if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T'; // Trillions
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B'; // Billions
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M'; // Millions
    if (num >= 1e3) return '$' + (num / 1e3).toFixed(2) + 'K'; // Thousands

    return '$' + num.toFixed(2);
  }
}
