import { Component, signal, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AuthModalComponent } from '../../features/auth/auth-modal.component';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { CurrencyService } from '../../core/services/currency.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { Currency, Theme } from '../../core/models/common.model';
import { WatchlistCoin } from '../../core/models/watchlist.model';
import { Coin } from '../../core/models/coin.model';
import { AssetService } from '../../core/services/asset.service';
import { Observable } from 'rxjs';
import { CompactNumberPipe } from '../../shared/pipes/compact-number.pipe';
import { AlertButtonComponent } from './components/alert-button/alert-button.component';
import { AlertDropdownComponent } from './components/alert-dropdown/alert-dropdown.component';
import { AlertManagementModalComponent } from './components/alert-management-modal/alert-management-modal.component';

/**
 * HeaderComponent
 *
 * Main application header with navigation and user controls
 *
 * **Features:**
 *
 * **Navigation:**
 * - Logo and brand link to home
 * - Cryptocurrency menu (Markets, Exchanges, NFT, DeFi)
 * - Exchange listings
 * - Community links (Feed, Topics, Articles, Leaderboard)
 * - Watchlist dropdown with price summaries
 *
 * **Search:**
 * - Global cryptocurrency search
 * - Real-time search results dropdown
 * - Navigate to coin detail from results
 * - Debounced search with loading states
 *
 * **User Controls:**
 * - Authentication (Login/Signup buttons when not authenticated)
 * - User profile menu (Profile, Settings, Logout)
 * - Alert notifications bell with unread count
 * - Alert management modal
 *
 * **Settings:**
 * - Currency selection (USD, EUR, GBP, etc.)
 * - Theme selection (Light/Dark/System)
 * - Language selection (English, Vietnamese, Chinese, Japanese, Spanish)
 * - System theme auto-sync with OS preference
 *
 * **Watchlist:**
 * - Quick view of watchlist coins
 * - Hover to show dropdown
 * - Live price updates
 * - 24h change indicators
 * - Navigate to coin details
 *
 * **Responsive Design:**
 * - Hover-based mega menus on desktop
 * - Click-outside handling to close dropdowns
 * - Mobile-friendly collapsible menus
 *
 * **Real-time Features:**
 * - Alert notifications via SignalR
 * - Live watchlist price updates
 * - System theme preference monitoring
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonComponent,
    AuthModalComponent,
    CompactNumberPipe,
    AlertButtonComponent,
    AlertDropdownComponent,
    AlertManagementModalComponent,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnDestroy {
  showAlertDropdown = signal(false);
  // UI State
  searchQuery = '';
  showSettingsMenu = signal(false);
  showCryptoMenu = signal(false);
  showExchangeMenu = signal(false);
  showCommunityMenu = signal(false);
  showWatchlistDropdown = signal(false);
  selectedLanguage = signal('English');
  systemTheme = signal(false);

  // Watchlist data
  watchlistCoins$: Observable<WatchlistCoin[]>;

  // Constants
  readonly languages = ['English', 'Tiếng Việt', '中文', '日本語', 'Español'];

  private systemThemeMediaQuery?: MediaQueryList;

  // Search
  searchResults = signal<Coin[]>([]);
  showSearchResults = signal(false);
  isSearching = signal(false);

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    public currencyService: CurrencyService,
    private watchlistService: WatchlistService,
    private assetService: AssetService,
    private router: Router
  ) {
    this.initializeSystemThemeListener();
    this.watchlistCoins$ = this.watchlistService.watchlistCoins$;
  }

  ngOnDestroy(): void {
    this.cleanupSystemThemeListener();
  }

  onSearch(): void {
    if (!this.searchQuery || this.searchQuery.trim().length < 1) {
      this.searchResults.set([]);
      this.showSearchResults.set(false);
      return;
    }

    this.isSearching.set(true);
    this.showSearchResults.set(true);

    this.assetService.searchAssets(this.searchQuery).subscribe({
      next: (coins) => {
        this.searchResults.set(coins);
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error('Search error:', err);
        this.searchResults.set([]);
        this.isSearching.set(false);
      },
    });
  }

  navigateToCoin(coin: Coin): void {
    this.router.navigate(['/coin', coin.symbol.toLowerCase()]);
    this.searchQuery = '';
    this.showSearchResults.set(false);
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
    this.showSettingsMenu.update((value) => !value);
    this.showCryptoMenu.set(false);
    this.showExchangeMenu.set(false);
    this.showCommunityMenu.set(false);
    this.showWatchlistDropdown.set(false);
    this.showSearchResults.set(false);
  }

  private closeSettingsMenu(): void {
    this.showSettingsMenu.set(false);
  }

  // Crypto Menu
  toggleCryptoMenu(): void {
    this.showCryptoMenu.update((value) => !value);
    this.showSettingsMenu.set(false);
    this.showExchangeMenu.set(false);
    this.showCommunityMenu.set(false);
    this.showWatchlistDropdown.set(false);
    this.showSearchResults.set(false);
  }

  openCryptoMenu(): void {
    this.showCryptoMenu.set(true);
    this.showSettingsMenu.set(false);
    this.showExchangeMenu.set(false);
    this.showCommunityMenu.set(false);
    this.showWatchlistDropdown.set(false);
    this.showSearchResults.set(false);
  }

  closeCryptoMenu(): void {
    this.showCryptoMenu.set(false);
  }

  // Exchange Menu
  openExchangeMenu(): void {
    this.showExchangeMenu.set(true);
    this.showSettingsMenu.set(false);
    this.showCryptoMenu.set(false);
    this.showCommunityMenu.set(false);
    this.showWatchlistDropdown.set(false);
    this.showSearchResults.set(false);
  }

  closeExchangeMenu(): void {
    this.showExchangeMenu.set(false);
  }

  // Community Menu
  openCommunityMenu(): void {
    this.showCommunityMenu.set(true);
    this.showSettingsMenu.set(false);
    this.showCryptoMenu.set(false);
    this.showExchangeMenu.set(false);
    this.showWatchlistDropdown.set(false);
    this.showSearchResults.set(false);
  }

  closeCommunityMenu(): void {
    this.showCommunityMenu.set(false);
  }

  // Watchlist Dropdown
  toggleWatchlistDropdown(): void {
    this.showWatchlistDropdown.update((value) => !value);
    this.showSettingsMenu.set(false);
    this.showCryptoMenu.set(false);
    this.showExchangeMenu.set(false);
    this.showCommunityMenu.set(false);
    this.showSearchResults.set(false);
  }

  openWatchlistDropdown(): void {
    this.showWatchlistDropdown.set(true);
    this.showSettingsMenu.set(false);
    this.showCryptoMenu.set(false);
    this.showExchangeMenu.set(false);
    this.showCommunityMenu.set(false);
    this.showSearchResults.set(false);
  }

  closeWatchlistDropdown(): void {
    this.showWatchlistDropdown.set(false);
  }

  navigateToCoinFromWatchlist(coinId: string): void {
    this.router.navigate(['/coin', coinId.toLowerCase()]);
    this.closeWatchlistDropdown();
  }

  getPercentClass(isPositive: boolean): string {
    return isPositive ? 'text-secondary' : 'text-accent';
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
    this.systemThemeMediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );
    this.systemThemeMediaQuery.addEventListener(
      'change',
      this.handleSystemThemeChange
    );
  }

  private cleanupSystemThemeListener(): void {
    this.systemThemeMediaQuery?.removeEventListener(
      'change',
      this.handleSystemThemeChange
    );
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
    if (!target.closest('.alert-menu-container')) {
      this.showAlertDropdown.set(false);
    }
    if (!target.closest('.search-container')) {
      this.showSearchResults.set(false);
    }
    // Watchlist dropdown is now hover-based, no click outside needed
  }

  toggleAlertDropdown() {
    this.showAlertDropdown.update((v) => !v);
  }

  // Alert Management Modal
  isAlertManagementModalOpen = signal(false);

  openAlertManagementModal(): void {
    this.isAlertManagementModalOpen.set(true);
    this.closeSettingsMenu();
  }

  closeAlertManagementModal(): void {
    this.isAlertManagementModalOpen.set(false);
  }
}
