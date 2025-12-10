import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertListComponent } from '../../../../features/profile/components/alert-list/alert-list.component';

/**
 * AlertManagementModalComponent
 *
 * Full-screen modal for managing user price alerts
 *
 * Features:
 * - Modal overlay with backdrop blur
 * - Contains AlertListComponent for full alert management
 * - Close button and backdrop click to dismiss
 * - Scrollable content area
 * - Responsive design (max-width 2xl)
 * - Smooth animations (fade + zoom in)
 *
 * Provides access to:
 * - View all user alerts
 * - Delete alerts
 * - Toggle alert active/inactive status
 *
 * Opened from header "All Alerts" link in AlertDropdownComponent
 */
@Component({
  selector: 'app-alert-management-modal',
  standalone: true,
  imports: [CommonModule, AlertListComponent],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      (click)="onBackdropClick($event)"
    >
      <div
        class="bg-card w-full max-w-2xl rounded-xl shadow-2xl border border-border flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between p-6 border-b border-border"
        >
          <h2 class="text-xl font-bold text-foreground">Alert Management</h2>
          <button
            (click)="close.emit()"
            class="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div
          class="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
        >
          <app-alert-list></app-alert-list>
        </div>
      </div>
    </div>
  `,
})
export class AlertManagementModalComponent {
  /** Controls modal visibility */
  @Input() isOpen = false;

  /** Emitted when modal should close */
  @Output() close = new EventEmitter<void>();

  /**
   * Handle backdrop click to close modal
   * Only closes if clicking outside the modal content
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
