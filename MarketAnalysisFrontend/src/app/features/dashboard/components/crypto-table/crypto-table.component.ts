import {
  Component,
  OnInit,
  signal,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { WatchlistService } from '../../../../core/services/watchlist.service';
import { AlertService } from '@app/core/services/alert.service';
import { Coin } from '../../../../core/models/coin.model';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { SparklineComponent } from '../../../../shared/components/sparkline/sparkline.component';
import { MarketOverview } from '@app/core/models/market.model';

interface Network {
  name: string;
  icon: string;
  color: string;
}

interface MenuPosition {
  left?: number;
  right?: number;
  top: number;
}

@Component({
  selector: 'app-crypto-table',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, SparklineComponent],
  templateUrl: './crypto-table.component.html',
  styleUrls: ['./crypto-table.component.css'],
})
export class CryptoTableComponent implements OnInit {
  @ViewChild('moreButton') moreButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('filterButton') filterButton!: ElementRef<HTMLButtonElement>;

  // Make Math available in template
  Math = Math;

  // Data properties
  coins: Coin[] = [];
  metrics: MarketOverview[] = [];
  filteredCoins: Coin[] = [];
  paginatedCoins: Coin[] = [];

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 15;
  totalPages = 0;
  private currentGroup: string[] = [];

  // UI state
  selectedNetwork = 'All Networks';
  selectedTab = 'Top';
  showNetworkMenu = signal(false);
  showFilterMenu = signal(false);
  menuPosition: MenuPosition = { left: 0, top: 0 };
  filterMenuPosition: MenuPosition = { left: 0, top: 0 };
  watchlistIds: number[] = [];
  isLoading: boolean = true;

  // Sorting
  sortField: 'rank' | 'marketCap' | 'volume' = 'rank';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Getter for template
  get sortAscending(): boolean {
    return this.sortDirection === 'asc';
  }

  // Constants
  readonly networks = [
    'All Networks',
    'Bitcoin',
    'Ethereum',
    'BSC',
    'Solana',
    'Base',
  ];
  readonly tabs = ['Top', 'Trending', 'Most Visited', 'New', 'Gainers'];
  readonly additionalNetworks: Network[] = [
    { name: 'Arbitrum', icon: '🔷', color: 'bg-blue-500' },
    { name: 'Avalanche', icon: '🔺', color: 'bg-red-500' },
    { name: 'Sui Network', icon: '💧', color: 'bg-blue-400' },
    { name: 'TRON', icon: '🔻', color: 'bg-red-600' },
    { name: 'Polygon', icon: '🔗', color: 'bg-purple-500' },
    { name: 'Sonic', icon: '⚡', color: 'bg-gray-700' },
    { name: 'HyperEVM', icon: '💚', color: 'bg-green-600' },
    { name: 'PulseChain', icon: '💜', color: 'bg-purple-600' },
    { name: 'Ethereum Classic', icon: '💎', color: 'bg-indigo-500' },
    { name: 'BNB Chain', icon: '🟡', color: 'bg-yellow-500' },
    {
      name: 'Solana',
      icon: '🌈',
      color: 'bg-gradient-to-r from-purple-500 to-blue-500',
    },
    { name: 'Base', icon: '🔵', color: 'bg-blue-600' },
  ];

  constructor(
    private apiService: ApiService,
    private watchlistService: WatchlistService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCoins();
    this.apiService.startGlobalMetricSignalR();
    this.alertService.startUserConnection();
    this.apiService.startSignalR(this.currentGroup);
    this.alertService.startGlobalConnection();

    // Subscribe to watchlist changes
    this.watchlistService.watchlistIds$.subscribe((ids) => {
      this.watchlistIds = ids;
    });
  }

  private loadCoins(): void {
    this.apiService.getCoins().subscribe({
      next: (coins) => {
        this.coins = coins;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading coins:', err);
        this.isLoading = false;
      },
    });

    this.apiService.coins$.subscribe((coins) => {
      this.coins = coins;
      this.applyFilter();
      if (coins.length > 0) {
        this.isLoading = false;
      }
    });
  }

  selectNetwork(network: string): void {
    this.selectedNetwork = network;
    this.currentPage = 1; // Reset to first page when changing filter
    this.applyFilter();
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
    this.currentPage = 1; // Reset to first page when changing tab
    this.applyFilter();
  }

  sortBy(field: 'rank' | 'marketCap' | 'volume'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc'; // Default to desc for metrics
    }
    this.showFilterMenu.set(false); // Close menu after selection
    this.applyFilter();
  }

  clearFilters(): void {
    this.sortField = 'rank';
    this.sortDirection = 'asc';
    this.currentPage = 1; // Reset to first page
    this.applyFilter();
  }

  toggleFilterMenu(): void {
    if (this.showFilterMenu()) {
      this.showFilterMenu.set(false);
      return;
    }

    if (this.filterButton?.nativeElement) {
      const rect = this.filterButton.nativeElement.getBoundingClientRect();
      const menuWidth = 224; // w-56 = 14rem = 224px

      this.filterMenuPosition = {
        right: window.innerWidth - rect.right,
        top: rect.bottom + 8,
      };
    }

    this.showFilterMenu.set(true);
    this.showNetworkMenu.set(false); // Close other menu
  }

  private parseCurrency(value: string): number {
    return Number(value.replace(/[^0-9.-]+/g, ''));
  }

  private applyFilter(): void {
    let result =
      this.selectedNetwork === 'All Networks'
        ? [...this.coins]
        : this.coins.filter((coin) => coin.network === this.selectedNetwork);

    // Apply Tab Filtering/Sorting Logic
    switch (this.selectedTab) {
      case 'Trending':
        // Sort by 24h Volume (highest to lowest)
        result.sort((a, b) => {
          const volA = this.parseCurrency(a.volume || '0');
          const volB = this.parseCurrency(b.volume || '0');
          return volB - volA;
        });
        break;
      case 'Most Visited':
        // Sort by viewCount (highest to lowest)
        result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'New':
        // Sort by creation date (newest first)
        result.sort((a, b) => {
          const dateA = new Date(a.dateAdd || 0).getTime();
          const dateB = new Date(b.dateAdd || 0).getTime();
          return dateB - dateA;
        });
        break;
      case 'Gainers':
        // Sort by 24h change (highest to lowest) - show all coins
        result.sort((a, b) => {
          const changeA = parseFloat((a.change24h || '0').replace('%', ''));
          const changeB = parseFloat((b.change24h || '0').replace('%', ''));
          return changeB - changeA;
        });
        break;
      case 'Top':
      default:
        // Default sort by Rank (handled below if no explicit sort)
        // If user hasn't clicked a column header, default to rank
        if (this.sortField === 'rank' && this.sortDirection === 'asc') {
          result.sort((a, b) => Number(a.rank) - Number(b.rank));
        }
        break;
    }

    // Apply explicit column sorting if user interacted with headers
    // Note: Tab logic sets a default sort, but column headers should override or refine it
    // For simplicity, if user clicks a header, we respect that over tab default sort
    // But here we might want to only apply explicit sort if it differs from tab default
    // or just let the user override.
    // Let's allow column sort to override tab sort if it's not the default rank sort
    // OR if the user explicitly clicked rank.

    // Actually, the requirement says "Top: Sorts by Rank (default)".
    // So if we are in 'Top' tab, we default to Rank.
    // If we are in 'Trending', we default to Volume.
    // If user clicks 'Market Cap', we sort by Market Cap.

    // To handle this cleanly:
    // 1. If user clicked a header (sortField/Direction set manually), use that.
    // 2. Else use tab default.

    // However, `sortBy` sets `sortField`.
    // Let's assume if `sortField` is 'rank' and `sortDirection` is 'asc', it's the "default" state.
    // But 'Trending' implies a different default.

    // Refined logic:
    // We apply tab specific sort FIRST (as above).
    // THEN, if the user has explicitly requested a sort (e.g. clicked Market Cap), we re-sort.
    // But we need to know if the user *explicitly* requested it.
    // Current `sortBy` implementation sets `sortField`.

    // Let's just stick to the tab logic being the primary sort when a tab is selected.
    // If the user clicks a header, it might break the "Trending" view, which is expected.
    // But for now, the code above applies tab sort.
    // The code below applies column sort.
    // We should only apply column sort if it's NOT the default rank sort,
    // OR if we want to support sorting within the filtered list (e.g. sort Gainers by Market Cap).

    // Let's apply column sort ONLY if it's not 'rank' (default) OR if direction is 'desc' (user clicked rank).
    if (this.sortField !== 'rank' || this.sortDirection !== 'asc') {
      result.sort((a, b) => {
        let valA: number;
        let valB: number;

        switch (this.sortField) {
          case 'marketCap':
            valA = this.parseCurrency(a.marketCap || '0');
            valB = this.parseCurrency(b.marketCap || '0');
            break;
          case 'volume':
            valA = this.parseCurrency(a.volume || '0');
            valB = this.parseCurrency(b.volume || '0');
            break;
          case 'rank':
          default:
            valA = Number(a.rank);
            valB = Number(b.rank);
            break;
        }

        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
      });
    }

    this.filteredCoins = result;
    this.updatePagination();
  }

  private async updatePagination(): Promise<void> {
    if (this.currentGroup.length > 0) {
      await this.apiService.leaveAssetGroups(this.currentGroup);
    }

    this.totalPages = Math.ceil(this.filteredCoins.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCoins = this.filteredCoins.slice(startIndex, endIndex);

    this.currentGroup = this.paginatedCoins.map((coin) => coin.symbol);
    this.apiService.startSignalR(this.currentGroup);
    await this.apiService.joinAssetGroup(this.currentGroup);
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, this.currentPage - 1);
      let end = Math.min(this.totalPages - 1, this.currentPage + 1);

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < this.totalPages - 1) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Show last page
      pages.push(this.totalPages);
    }

    return pages;
  }

  navigateToCoin(symbol: string): void {
    this.router.navigate(['/coin', symbol.toLowerCase()]);
  }

  getPercentClass(isPositive: boolean): string {
    return isPositive ? 'text-secondary' : 'text-accent';
  }

  // Watchlist Methods
  toggleWatchlist(coinId: string, event: MouseEvent): void {
    event.stopPropagation(); // Prevent row click navigation

    // Convert coinId to number (it's the asset ID from backend)
    const assetId = Number(coinId);

    // WatchlistService will open auth modal if user is not authenticated
    this.watchlistService.toggleWatchlist(assetId);
  }

  isInWatchlist(coinId: string): boolean {
    const assetId = Number(coinId);
    return this.watchlistIds.includes(assetId);
  }

  toggleNetworkMenu(): void {
    if (!this.showNetworkMenu()) {
      this.calculateMenuPosition();
    }
    this.showNetworkMenu.update((value) => !value);
  }

  private calculateMenuPosition(): void {
    if (!this.moreButton) return;

    const buttonRect = this.moreButton.nativeElement.getBoundingClientRect();
    const MENU_GAP = 8;

    this.menuPosition = {
      left: buttonRect.left,
      top: buttonRect.bottom + MENU_GAP,
    };
  }

  private closeNetworkMenu(): void {
    this.showNetworkMenu.set(false);
  }

  selectAdditionalNetwork(network: Network): void {
    this.selectedNetwork = network.name;
    this.applyFilter();
    this.closeNetworkMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Handle network menu
    if (this.showNetworkMenu()) {
      const isClickInsideButton = target.closest('.network-more-btn');
      const isClickInsideMenu = target.closest('.network-menu-container');

      if (!isClickInsideButton && !isClickInsideMenu) {
        this.closeNetworkMenu();
      }
    }

    // Handle filter menu
    if (this.showFilterMenu()) {
      const isClickInsideFilterButton =
        this.filterButton?.nativeElement.contains(target);
      const isClickInsideFilterMenu = target.closest('.filter-menu-container'); // Filter menu container

      if (!isClickInsideFilterButton && !isClickInsideFilterMenu) {
        this.showFilterMenu.set(false);
      }
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScrollOrResize(): void {
    if (this.showNetworkMenu()) {
      this.calculateMenuPosition();
    }
    if (this.showFilterMenu()) {
      // Recalculate filter menu position on scroll/resize
      if (this.filterButton?.nativeElement) {
        const rect = this.filterButton.nativeElement.getBoundingClientRect();
        this.filterMenuPosition = {
          right: window.innerWidth - rect.right,
          top: rect.bottom + 8,
        };
      }
    }
  }
}
