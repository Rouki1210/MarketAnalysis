import { Injectable, signal } from '@angular/core';
import { Theme } from '../models/common.model';

/**
 * ThemeService
 *
 * Manages application theme (dark/light mode) including:
 * - Persistent theme storage
 * - DOM manipulation for Tailwind dark mode
 * - Theme toggling functionality
 * - Reactive theme signal for UI updates
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  // Reactive signal for current theme
  private currentTheme = signal<Theme>('dark');

  // Read-only exposure of theme signal for components
  theme = this.currentTheme.asReadonly();

  constructor() {
    this.initializeTheme();
  }

  /**
   * Load saved theme preference from localStorage
   * Defaults to dark theme if no preference is saved
   * Applies theme to DOM on initialization
   * @private
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const theme = savedTheme || 'dark';
    this.setTheme(theme);
  }

  /**
   * Set the active theme
   * Updates signal, localStorage, and applies CSS class to DOM
   *
   * @param theme Theme to set ('dark' or 'light')
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem('theme', theme);

    // Apply Tailwind dark mode class to document root
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  /**
   * Toggle between dark and light themes
   * Convenience method for theme switcher UI components
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
}
