import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinDetail } from '../../../../core/models/coin.model';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-coin-stats',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  templateUrl: './coin-stats.component.html',
  styleUrls: ['./coin-stats.component.css']
})
export class CoinStatsComponent {
  @Input() coinDetail!: CoinDetail;

  get statsArray() {
    if (!this.coinDetail) return [];
    
    return [
      { 
        label: 'Market cap', 
        value: this.coinDetail.stats.marketCap.value,
        change: this.coinDetail.stats.marketCap.change
      },
      { 
        label: 'Volume (24h)', 
        value: this.coinDetail.stats.volume24h.value,
        change: this.coinDetail.stats.volume24h.change
      },
      { 
        label: 'Vol/Mkt cap (24h)', 
        value: this.coinDetail.stats.volumeMarketCapRatio
      },
      { 
        label: 'Max supply', 
        value: this.coinDetail.stats.maxSupply
      },
      { 
        label: 'Circulating supply', 
        value: this.coinDetail.stats.circulatingSupply
      },
      { 
        label: 'Total supply', 
        value: this.coinDetail.stats.totalSupply
      }
    ];
  }
}

