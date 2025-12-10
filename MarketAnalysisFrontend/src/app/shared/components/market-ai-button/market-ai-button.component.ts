import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * MarketAiButtonComponent
 *
 * Floating action button to open AI market analysis chat
 *
 * Features:
 * - Fixed position (bottom-right of viewport)
 * - Pulsing animation ring for attention
 * - Robot emoji icon
 * - Emits click event to parent component
 *
 * Typically shown on dashboard page to open MarketOverviewChatComponent
 */
@Component({
  selector: 'app-market-ai-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="market-ai-button"
      (click)="handleClick()"
      title="Market AI Analysis"
    >
      <span class="ai-icon">🤖</span>
      <span class="pulse-ring"></span>
    </button>
  `,
  styleUrls: ['./market-ai-button.component.css'],
})
export class MarketAiButtonComponent {
  /** Emitted when button is clicked */
  @Output() buttonClick = new EventEmitter<void>();

  /** Handle button click and emit event */
  handleClick() {
    this.buttonClick.emit();
  }
}
