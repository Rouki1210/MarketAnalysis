import { Component, OnInit, signal, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { Coin } from '../../../../core/models/coin.model';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { SparklineComponent } from '../../../../shared/components/sparkline/sparkline.component';

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
  
  // Data properties
  coins: Coin[] = [];
  filteredCoins: Coin[] = [];
  
  // UI state
  selectedNetwork = 'All Networks';
  selectedTab = 'Top';
  showNetworkMenu = signal(false);
  menuPosition: MenuPosition = { left: 0, top: 0 };

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCoins();
  }

  private loadCoins(): void {
    this.apiService.getCoins().subscribe({
      next: (coins) => {
        this.coins = coins;
        this.applyFilter();
      },
      error: (err) => console.error('Error loading coins:', err)
    });

    this.apiService.coins$.subscribe(coins => {
      this.coins = coins;
      this.applyFilter();
    });
  }

  selectNetwork(network: string): void {
    this.selectedNetwork = network;
    this.applyFilter();
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
    // TODO: Load different data based on selected tab
  }

  private applyFilter(): void {
    this.filteredCoins = this.selectedNetwork === 'All Networks'
      ? this.coins
      : this.coins.filter(coin => coin.network === this.selectedNetwork);
  }

  navigateToCoin(symbol: string): void {
    this.router.navigate(['/coin', symbol.toLowerCase()]);
  }

  getPercentClass(isPositive: boolean): string {
    return isPositive ? 'text-secondary' : 'text-accent';
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

