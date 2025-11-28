import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  @Output() buttonClick = new EventEmitter<void>();

  handleClick() {
    this.buttonClick.emit();
  }
}
