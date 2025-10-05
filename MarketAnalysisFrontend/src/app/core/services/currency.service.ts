import { Injectable, signal } from '@angular/core';
import { Currency } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private currentCurrency = signal<Currency>('USD');
  
  currency = this.currentCurrency.asReadonly();

  // Exchange rates (mock data)
  private exchangeRates: Record<Currency, number> = {
    USD: 1,
    VND: 25000,
    BTC: 0.0000082,
    ETH: 0.00022
  };

  constructor() {
    this.initializeCurrency();
  }

  private initializeCurrency(): void {
    const savedCurrency = localStorage.getItem('currency') as Currency;
    if (savedCurrency) {
      this.currentCurrency.set(savedCurrency);
    }
  }

  setCurrency(currency: Currency): void {
    this.currentCurrency.set(currency);
    localStorage.setItem('currency', currency);
  }

  convert(amount: number, from: Currency = 'USD', to?: Currency): number {
    const targetCurrency = to || this.currentCurrency();
    const usdAmount = amount / this.exchangeRates[from];
    return usdAmount * this.exchangeRates[targetCurrency];
  }

  formatCurrency(amount: number, currency?: Currency): string {
    const curr = currency || this.currentCurrency();
    
    const formatters: Record<Currency, (n: number) => string> = {
      USD: (n) => `$${this.formatNumber(n)}`,
      VND: (n) => `₫${this.formatNumber(n)}`,
      BTC: (n) => `₿${n.toFixed(8)}`,
      ETH: (n) => `Ξ${n.toFixed(6)}`
    };

    return formatters[curr](amount);
  }

  private formatNumber(num: number): string {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  }
}

