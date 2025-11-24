import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../core/services/alert.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-alert-button',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  template: `
    <button
      class="relative p-2 rounded-full hover:bg-muted transition-colors"
      (click)="toggle.emit()"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-bell"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>

      <span
        *ngIf="unreadCount$ | async as count"
        class="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
      >
        {{ count > 99 ? '99+' : count }}
      </span>
    </button>
  `,
  styles: [],
})
export class AlertButtonComponent {
  @Output() toggle = new EventEmitter<void>();
  private alertService = inject(AlertService);
  unreadCount$ = this.alertService.unreadCount$;
}
