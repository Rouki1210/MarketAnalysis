import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinDetail } from '../../../../core/models/coin.model';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

/**
 * CoinStatsComponent
 *
 * Displays key statistics for a cryptocurrency
 *
 * Shows:
 * - Market capitalization with 24h change
 * - 24-hour trading volume with change
 * - Volume to market cap ratio
 * - Max supply
 * - Circulating supply
 * - Total supply
 *
 * Includes AI analysis button to open coin-specific AI insights
 */
@Component({
  selector: 'app-coin-stats',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  templateUrl: './coin-stats.component.html',
  styleUrls: ['./coin-stats.component.css'],
})
export class CoinStatsComponent {
  /** Coin detail data with statistics */
  @Input() coinDetail!: CoinDetail;

  /** Emitted when AI analysis button clicked */
  @Output() aiAnalysisClick = new EventEmitter<void>();

  /**
   * Emit AI analysis click event
   */
  openAiAnalysis() {
    this.aiAnalysisClick.emit();
  }

  /**
   * Convert coin stats to array format for template iteration
   * @returns Array of stat objects with label, value, and optional change
   */
  get statsArray() {
    if (!this.coinDetail) return [];

    return [
      {
        label: 'Market cap',
        value: this.coinDetail.stats.marketCap.value,
        change: this.coinDetail.stats.marketCap.change,
      },
      {
        label: 'Volume (24h)',
        value: this.coinDetail.stats.volume24h.value,
        change: this.coinDetail.stats.volume24h.change,
      },
      {
        label: 'Vol/Mkt cap (24h)',
        value: this.coinDetail.stats.volumeMarketCapRatio,
      },
      {
        label: 'Max supply',
        value: this.coinDetail.stats.maxSupply,
      },
      {
        label: 'Circulating supply',
        value: this.coinDetail.stats.circulatingSupply,
      },
      {
        label: 'Total supply',
        value: this.coinDetail.stats.totalSupply,
      },
    ];
  }
}
