import { Pipe, PipeTransform } from '@angular/core';

/**
 * CompactNumberPipe
 * Formats large numbers into compact notation (e.g., 1.2B, 3.4T)
 * 
 * Usage: {{ value | compactNumber }}
 * 
 * Examples:
 * - 1000 => 1K
 * - 1500000 => 1.5M
 * - 1200000000 => 1.2B
 * - 2500000000000 => 2.5T
 */
@Pipe({
  name: 'compactNumber',
  standalone: true
})
export class CompactNumberPipe implements PipeTransform {
  transform(value: string | number | undefined | null): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    // Remove currency symbols, commas, and spaces if present
    const cleanValue = typeof value === 'string' 
      ? value.replace(/[$,\s]/g, '') 
      : value.toString();

    const numValue = parseFloat(cleanValue);
    
    if (isNaN(numValue)) {
      return '-';
    }

    const abs = Math.abs(numValue);
    const sign = numValue < 0 ? '-' : '';

    if (abs >= 1e12) {
      // Trillions
      return sign + '$' + (abs / 1e12).toFixed(2) + 'T';
    } else if (abs >= 1e9) {
      // Billions
      return sign + '$' + (abs / 1e9).toFixed(2) + 'B';
    } else if (abs >= 1e6) {
      // Millions
      return sign + '$' + (abs / 1e6).toFixed(2) + 'M';
    } else if (abs >= 1e3) {
      // Thousands
      return sign + '$' + (abs / 1e3).toFixed(2) + 'K';
    } else {
      // Less than 1000
      return sign + '$' + abs.toFixed(2);
    }
  }
}
