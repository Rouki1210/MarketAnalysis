import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CryptoTableComponent } from './components/crypto-table/crypto-table.component';
import { MarketAiButtonComponent } from '../../shared/components/market-ai-button/market-ai-button.component';
import { MarketOverviewChatComponent } from './components/market-overview-chat/market-overview-chat.component';

/**
 * DashboardPage
 *
 * Main dashboard view for cryptocurrency market overview
 *
 * Features:
 * - Cryptocurrency table with sorting, filtering, and search
 * - Floating AI chatbot button for market insights
 * - AI-powered market overview chat interface
 *
 * Layout:
 * - Full-screen cryptocurrency table as primary content
 * - Floating action button for AI chat (bottom-right)
 * - Slide-in chat panel when AI button clicked
 */
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
      <!-- Main cryptocurrency data table -->
      <app-crypto-table></app-crypto-table>

      <!-- Floating AI Button (shown when chat is closed) -->
      <app-market-ai-button
        *ngIf="!showMarketChat"
        (buttonClick)="showMarketChat = true"
      ></app-market-ai-button>

      <!-- Market Overview AI Chat Panel -->
      <app-market-overview-chat
        [isOpen]="showMarketChat"
        (close)="showMarketChat = false"
      >
      </app-market-overview-chat>
    </div>
  `,
})
export class DashboardPage {
  /** Controls visibility of AI chat panel */
  showMarketChat = false;
}
