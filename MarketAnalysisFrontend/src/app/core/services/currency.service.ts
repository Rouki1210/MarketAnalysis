import { Injectable, signal } from '@angular/core';
import { Currency } from '../models/common.model';

/**
 * CurrencyService
 *
 * Manages currency preferences and conversions for displaying prices.
 * Supports multiple currencies including fiat (USD, VND) and crypto (BTC, ETH).
 *
 * Features:
 * - Persistent currency preference storage
 * - Currency conversion between different types
 * - Smart number formatting with abbreviations (K, M, B, T)
 * - Currency-specific formatting symbols
 */
@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  // Reactive signal for current currency
  private currentCurrency = signal<Currency>('USD');

  // Read-only exposure of currency signal
  currency = this.currentCurrency.asReadonly();

  // Exchange rates relative to USD
  // Note: In production, these should be fetched from an API and updated regularly
  private exchangeRates: Record<Currency, number> = {
    USD: 1,
    VND: 25000, // Vietnamese Dong
    BTC: 0.0000082, // Bitcoin (approximate)
    ETH: 0.00022, // Ethereum (approximate)
  };

  constructor() {
    this.initializeCurrency();
  }

  /**
   * Load saved currency preference from localStorage
   * Defaults to USD if no preference is saved
   * @private
   */
  private initializeCurrency(): void {
    const savedCurrency = localStorage.getItem('currency') as Currency;
    if (savedCurrency) {
      this.currentCurrency.set(savedCurrency);
    }
  }

  /**
   * Set the active currency for price display
   * Persists preference to localStorage
   * @param currency Currency code to set
   */
  setCurrency(currency: Currency): void {
    this.currentCurrency.set(currency);
    localStorage.setItem('currency', currency);
  }

  /**
   * Convert amount from one currency to another
   * Converts through USD as intermediary for accuracy
   *
   * @param amount Amount to convert
   * @param from Source currency (defaults to USD)
   * @param to Target currency (defaults to current currency)
   * @returns Converted amount
   */
  convert(amount: number, from: Currency = 'USD', to?: Currency): number {
    const targetCurrency = to || this.currentCurrency();
    // Convert to USD first, then to target currency
    const usdAmount = amount / this.exchangeRates[from];
    return usdAmount * this.exchangeRates[targetCurrency];
  }

  /**
   * Format amount with currency symbol and abbreviation
   * Applies currency-specific formatting rules
   *
   * @param amount Numeric amount to format
   * @param currency Currency for formatting (defaults to current)
   * @returns Formatted currency string (e.g., "$1.25M", "₿0.00001234")
   */
  formatCurrency(amount: number, currency?: Currency): string {
    const curr = currency || this.currentCurrency();

    // Currency-specific formatters with appropriate symbols
    const formatters: Record<Currency, (n: number) => string> = {
      USD: (n) => `$${this.formatNumber(n)}`,
      VND: (n) => `₫${this.formatNumber(n)}`,
      BTC: (n) => `₿${n.toFixed(8)}`, // Bitcoin typically shows 8 decimals
      ETH: (n) => `Ξ${n.toFixed(6)}`, // Ethereum typically shows 6 decimals
    };

    return formatters[curr](amount);
  }

  /**
   * Format number with K/M/B/T abbreviations
   * Makes large numbers more readable (e.g., 1500000 -> "1.50M")
   *
   * @param num Number to format
   * @returns Formatted string with abbreviation
   * @private
   */
  private formatNumber(num: number): string {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T'; // Trillion
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'; // Billion
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'; // Million
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'; // Thousand
    return num.toFixed(2);
  }
}
