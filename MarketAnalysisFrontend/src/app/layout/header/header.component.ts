import { Component, signal, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AuthModalComponent } from '../../features/auth/auth-modal.component';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { CurrencyService } from '../../core/services/currency.service';
import { Currency, Theme } from '../../core/models/common.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonComponent, AuthModalComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnDestroy {
  // UI State
  searchQuery = '';
  showSettingsMenu = signal(false);
  showCryptoMenu = signal(false);
  selectedLanguage = signal('English');
  systemTheme = signal(false);

  // Constants
  readonly languages = ['English', 'Tiếng Việt', '中文', '日本語', 'Español'];

  private systemThemeMediaQuery?: MediaQueryList;

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    public currencyService: CurrencyService,
    private router: Router
  ) {
    this.initializeSystemThemeListener();
  }

  ngOnDestroy(): void {
    this.cleanupSystemThemeListener();
  }

  // Search
  onSearch(): void {
    console.log('Search:', this.searchQuery);
    // TODO: Implement search functionality
  }

  // Authentication
  openAuthModal(tab: 'login' | 'signup' = 'login'): void {
    this.authService.openAuthModal(tab);
    this.closeSettingsMenu();
  }

  logout(): void {
    this.authService.logout();
    this.closeSettingsMenu();
  }

  // Settings Menu
  toggleSettingsMenu(): void {
    this.showSettingsMenu.update(value => !value);
    this.showCryptoMenu.set(false);
  }

  private closeSettingsMenu(): void {
    this.showSettingsMenu.set(false);
  }

  // Crypto Menu
  toggleCryptoMenu(): void {
    this.showCryptoMenu.update(value => !value);
    this.showSettingsMenu.set(false);
  }

  openCryptoMenu(): void {
    this.showCryptoMenu.set(true);
    this.showSettingsMenu.set(false);
  }

  closeCryptoMenu(): void {
    this.showCryptoMenu.set(false);
  }

  // Navigation
  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.closeSettingsMenu();
  }

  // Settings
  selectLanguage(language: string): void {
    this.selectedLanguage.set(language);
  }

  selectCurrency(currency: Currency): void {
    this.currencyService.setCurrency(currency);
  }

  selectTheme(theme: Theme): void {
    this.systemTheme.set(false);
    this.themeService.setTheme(theme);
  }

  selectSystemTheme(): void {
    this.systemTheme.set(true);
    this.applySystemTheme();
  }

  isSystemTheme(): boolean {
    return this.systemTheme();
  }

  // System Theme Management
  private initializeSystemThemeListener(): void {
    this.systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemThemeMediaQuery.addEventListener('change', this.handleSystemThemeChange);
  }

  private cleanupSystemThemeListener(): void {
    this.systemThemeMediaQuery?.removeEventListener('change', this.handleSystemThemeChange);
  }

  private handleSystemThemeChange = (e: MediaQueryListEvent): void => {
    if (this.systemTheme()) {
      this.themeService.setTheme(e.matches ? 'dark' : 'light');
    }
  };

  private applySystemTheme(): void {
    const isDarkMode = this.systemThemeMediaQuery?.matches ?? false;
    this.themeService.setTheme(isDarkMode ? 'dark' : 'light');
  }

  // Click Outside Handler
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.settings-menu-container')) {
      this.closeSettingsMenu();
    }
    // Removed crypto menu click outside handler since we use hover now
  }
}

