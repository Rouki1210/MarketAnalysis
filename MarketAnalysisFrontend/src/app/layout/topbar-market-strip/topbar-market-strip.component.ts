import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/card/card.component';
import { MarketStats } from '../../core/models/market.model';

@Component({
  selector: 'app-topbar-market-strip',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './topbar-market-strip.component.html',
  styleUrls: ['./topbar-market-strip.component.css']
})
export class TopbarMarketStripComponent implements OnInit {
  marketStats: MarketStats[] = [];

  ngOnInit(): void {
    this.marketStats = [
      {
        title: 'Market Cap',
        value: '$4.2T',
        change: '+2.17%',
        isPositive: true
      },
      {
        title: '24h Vol',
        value: '$194.88B',
        change: '+2.01%',
        isPositive: true
      },
      {
        title: 'BTC Dominance',
        value: '58.0%',
        subtitle: 'Bitcoin'
      },
      {
        title: 'ETH Dominance',
        value: '13.0%',
        subtitle: 'Ethereum'
      },
      {
        title: 'Fear & Greed',
        value: '57',
        subtitle: 'Neutral'
      }
    ];
  }
}

