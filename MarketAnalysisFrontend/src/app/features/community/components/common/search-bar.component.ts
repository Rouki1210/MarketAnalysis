import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * SearchBarComponent
 *
 * Search input for community content
 *
 * Features:
 * - Search icon prefix
 * - Two-way binding via valueChange event
 * - Customizable placeholder
 * - Purple-themed styling
 */
@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="'relative ' + className">
      <span
        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
        >🔍</span
      >
      <input
        type="text"
        [value]="value"
        (input)="onValueChange($event)"
        [placeholder]="placeholder"
        class="w-full bg-white/10 border border-purple-500/30 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
      />
    </div>
  `,
  styles: [],
})
export class SearchBarComponent {
  @Input() value = '';
  @Input() placeholder = 'Search...';
  @Input() className = '';
  @Output() valueChange = new EventEmitter<string>();

  onValueChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
