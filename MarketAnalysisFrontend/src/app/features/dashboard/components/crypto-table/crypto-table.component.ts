import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { Coin } from '../../../../core/models/coin.model';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { SparklineComponent } from '../../../../shared/components/sparkline/sparkline.component';

@Component({
  selector: 'app-crypto-table',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, SparklineComponent],
  templateUrl: './crypto-table.component.html',
  styleUrls: ['./crypto-table.component.css']
})
export class CryptoTableComponent implements OnInit {
  coins: Coin[] = [];
  filteredCoins: Coin[] = [];
  selectedNetwork = 'All Networks';
  selectedTab = 'Top';

  networks = ['All Networks', 'Bitcoin', 'Ethereum', 'BSC', 'Solana', 'Base'];
  tabs = ['Top', 'Trending', 'Most Visited', 'New', 'Gainers', 'Real-World Assets'];

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCoins();
  }

  loadCoins(): void {
    this.apiService.getPrices().subscribe(coins => {
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
    // In a real app, load different data based on tab
  }

  applyFilter(): void {
    if (this.selectedNetwork === 'All Networks') {
      this.filteredCoins = this.coins;
    } else {
      this.filteredCoins = this.coins.filter(coin => coin.network === this.selectedNetwork);
    }
  }

  navigateToCoin(symbol: string): void {
    this.router.navigate(['/coin', symbol.toLowerCase()]);
  }

  getPercentClass(isPositive: boolean): string {
    return isPositive ? 'text-secondary' : 'text-accent';
  }
}

