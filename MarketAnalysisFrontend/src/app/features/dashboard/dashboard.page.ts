import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CryptoTableComponent } from './components/crypto-table/crypto-table.component';
import { MarketAiButtonComponent } from '../../shared/components/market-ai-button/market-ai-button.component';
import { MarketOverviewChatComponent } from './components/market-overview-chat/market-overview-chat.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CryptoTableComponent,
    MarketAiButtonComponent,
    MarketOverviewChatComponent,
  ],
  template: `
    <div class="min-h-screen p-4 lg:p-6">
      <app-crypto-table></app-crypto-table>

      <!-- Floating AI Button -->
      <app-market-ai-button
        *ngIf="!showMarketChat"
        (buttonClick)="showMarketChat = true"
      ></app-market-ai-button>

      <!-- Market Overview Chat -->
      <app-market-overview-chat
        [isOpen]="showMarketChat"
        (close)="showMarketChat = false"
      >
      </app-market-overview-chat>
    </div>
  `,
})
export class DashboardPage {
  showMarketChat = false;
}
