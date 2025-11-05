import { Component, OnInit, signal, HostListener, ViewChild, ElementRef } from '@angular/core';
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
  left: number;
  top: number;
}

@Component({
  selector: 'app-crypto-table',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, SparklineComponent],
  templateUrl: './crypto-table.component.html',
  styleUrls: ['./crypto-table.component.css']
})
export class CryptoTableComponent implements OnInit {
  @ViewChild('moreButton') moreButton!: ElementRef<HTMLButtonElement>;
  
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
  
  // UI state
  selectedNetwork = 'All Networks';
  selectedTab = 'Top';
  showNetworkMenu = signal(false);
  menuPosition: MenuPosition = { left: 0, top: 0 };
  watchlistIds: string[] = [];
  isLoading: boolean = true;

  // Constants
  readonly networks = ['All Networks', 'Bitcoin', 'Ethereum', 'BSC', 'Solana', 'Base'];
  readonly tabs = ['Top', 'Trending', 'Most Visited', 'New', 'Gainers', 'Real-World Assets'];
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
    { name: 'Solana', icon: '🌈', color: 'bg-gradient-to-r from-purple-500 to-blue-500' },
    { name: 'Base', icon: '🔵', color: 'bg-blue-600' }
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
    
    // Subscribe to watchlist changes
    this.watchlistService.watchlistIds$.subscribe(ids => {
      this.watchlistIds = ids;
    });
    this.alertService.startConnection();
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
      }
    });

    this.apiService.coins$.subscribe(coins => {
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
    // TODO: Load different data based on selected tab
  }

  private applyFilter(): void {
    this.filteredCoins = this.selectedNetwork === 'All Networks'
      ? this.coins
      : this.coins.filter(coin => coin.network === this.selectedNetwork);
    
    this.updatePagination();
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredCoins.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCoins = this.filteredCoins.slice(startIndex, endIndex);
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
    
    // WatchlistService will open auth modal if user is not authenticated
    this.watchlistService.toggleWatchlist(coinId);
  }

  isInWatchlist(coinId: string): boolean {
    return this.watchlistIds.includes(coinId);
  }

  toggleNetworkMenu(): void {
    if (!this.showNetworkMenu()) {
      this.calculateMenuPosition();
    }
    this.showNetworkMenu.update(value => !value);
  }

  private calculateMenuPosition(): void {
    if (!this.moreButton) return;

    const buttonRect = this.moreButton.nativeElement.getBoundingClientRect();
    const MENU_GAP = 8;
    
    this.menuPosition = {
      left: buttonRect.left,
      top: buttonRect.bottom + MENU_GAP
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
    if (!this.showNetworkMenu()) return;

    const target = event.target as HTMLElement;
    const isClickInsideButton = target.closest('.network-more-btn');
    const isClickInsideMenu = target.closest('.network-menu-container');
    
    if (!isClickInsideButton && !isClickInsideMenu) {
      this.closeNetworkMenu();
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScrollOrResize(): void {
    if (this.showNetworkMenu()) {
      this.calculateMenuPosition();
    }
  }
}

