import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 mb-6">
      <div class="flex gap-2">
        <button
          *ngFor="let filter of filters"
          [class]="getFilterClasses(filter)"
          (click)="onFilterClick(filter)">
          {{ filter }}
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class FilterBarComponent {
  @Input() selectedFilter = 'trending';
  @Output() filterChange = new EventEmitter<string>();

  filters = ['trending', 'latest', 'top'];

  getFilterClasses(filter: string): string {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all';
    const activeClasses = 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    const inactiveClasses = 'text-gray-300 hover:bg-white/10';

    return `${baseClasses} ${filter === this.selectedFilter ? activeClasses : inactiveClasses}`;
  }

  onFilterClick(filter: string): void {
    this.filterChange.emit(filter);
  }
}

