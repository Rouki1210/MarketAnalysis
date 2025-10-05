import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Market } from '../../../../core/models/market.model';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-market-pairs-table',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, BadgeComponent],
  templateUrl: './market-pairs-table.component.html',
  styleUrls: ['./market-pairs-table.component.css']
})
export class MarketPairsTableComponent {
  @Input() markets: Market[] = [];

  selectedFilter = 'ALL';
  filters = ['ALL', 'CEX', 'DEX', 'Spot'];

  selectFilter(filter: string): void {
    this.selectedFilter = filter;
  }
}

