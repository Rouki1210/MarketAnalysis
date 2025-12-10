import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Market } from '../../../../core/models/market.model';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

/**
 * MarketPairsTableComponent
 *
 * Displays trading pairs for a cryptocurrency across exchanges
 *
 * Shows:
 * - Exchange name
 * - Trading pair (e.g., BTC/USDT)
 * - Current price on that exchange
 * - 24h trading volume
 * - Data confidence level
 *
 * Filters:
 * - ALL: Show all markets
 * - CEX: Centralized exchanges only
 * - DEX: Decentralized exchanges only
 * - Spot: Spot trading markets
 */
@Component({
  selector: 'app-market-pairs-table',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, BadgeComponent],
  templateUrl: './market-pairs-table.component.html',
  styleUrls: ['./market-pairs-table.component.css'],
})
export class MarketPairsTableComponent {
  /** List of trading pairs/markets */
  @Input() markets: Market[] = [];

  /** Currently selected filter */
  selectedFilter = 'ALL';

  /** Available market type filters */
  filters = ['ALL', 'CEX', 'DEX', 'Spot'];

  /**
   * Select market filter
   * @param filter Filter to apply
   */
  selectFilter(filter: string): void {
    this.selectedFilter = filter;
  }
}
