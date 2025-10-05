import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CoinDetail } from '../../core/models/coin.model';
import { Market } from '../../core/models/market.model';
import { CoinStatsComponent } from './components/coin-stats/coin-stats.component';
import { PriceChartComponent } from './components/price-chart/price-chart.component';
import { MarketPairsTableComponent } from './components/market-pairs-table/market-pairs-table.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-coin',
  standalone: true,
  imports: [
    CommonModule,
    CoinStatsComponent,
    PriceChartComponent,
    MarketPairsTableComponent,
    ButtonComponent
  ],
  templateUrl: './coin.page.html',
  styleUrls: ['./coin.page.css']
})
export class CoinPage implements OnInit {
  coinDetail?: CoinDetail;
  markets: Market[] = [];
  selectedTab = 'Chart';
  tabs = ['Chart', 'Markets', 'News', 'Yield', 'Market Cycles', 'About'];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const symbol = params['symbol']?.toUpperCase();
      if (symbol) {
        this.loadCoinData(symbol);
      }
    });
  }

  loadCoinData(symbol: string): void {
    this.apiService.getCoinBySymbol(symbol).subscribe(detail => {
      this.coinDetail = detail;
    });

    this.apiService.getMarketPairs(symbol).subscribe(markets => {
      this.markets = markets;
    });
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }
}

