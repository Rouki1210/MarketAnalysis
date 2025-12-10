import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  AlertService,
  AutoAlert,
} from '../../../../core/services/alert.service';
import { Router } from '@angular/router';

/**
 * AlertDropdownComponent
 *
 * Dropdown panel displaying price alert notifications
 *
 * Features:
 * - Lists triggered price alerts (global + user alerts)
 * - Shows alert details (target price, actual price, difference %)
 * - Unread indicator (highlighted background)
 * - Mark all as read functionality
 * - Click alert to mark as viewed
 * - Real-time updates via AlertService observables
 * - Scrollable list (max 400px height)
 * - Time display for each alert
 *
 * Data displays:
 * - Asset symbol (e.g., "BTC Price Alert")
 * - Target vs actual price
 * - Price difference percentage (green/red)
 * - Trigger timestamp
 *
 * Opened by clicking AlertButtonComponent in header
 */
@Component({
  selector: 'app-alert-dropdown',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div
      class="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-card shadow-lg z-50 overflow-hidden"
    >
      <div class="flex items-center justify-between border-b p-3">
        <h3 class="font-semibold text-sm">Notifications</h3>
        <button
          (click)="markAllAsRead()"
          class="text-xs text-primary hover:underline"
          [disabled]="(unreadCount$ | async) === 0"
        >
          Mark all as read
        </button>
      </div>

      <div class="max-h-[400px] overflow-y-auto">
        <div
          *ngIf="(alerts$ | async)?.length === 0"
          class="p-4 text-center text-sm text-muted-foreground"
        >
          No notifications
        </div>

        <div
          *ngFor="let alert of alerts$ | async"
          class="flex flex-col gap-1 border-b p-3 transition-colors hover:bg-muted/50 cursor-pointer"
          [class.bg-muted-50]="!alert.wasViewed"
          (click)="handleAlertClick(alert)"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium text-sm"
              >{{ alert.assetSymbol }} Price Alert</span
            >
            <span class="text-[10px] text-muted-foreground">{{
              alert.triggeredAt | date : 'shortTime'
            }}</span>
          </div>

          <div class="text-xs text-muted-foreground">
            Target: {{ alert.targetPrice | currency }} | Actual:
            {{ alert.actualPrice | currency }}
          </div>

          <div
            *ngIf="alert.priceDifference"
            class="text-xs font-medium"
            [class.text-green-500]="alert.priceDifference > 0"
            [class.text-red-500]="alert.priceDifference < 0"
          >
            {{ alert.priceDifference > 0 ? '+' : ''
            }}{{ alert.priceDifference | number : '1.2-2' }}%
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AlertDropdownComponent implements OnInit {
  private alertService = inject(AlertService);
  private router = inject(Router);

  /** Observable stream of triggered alerts */
  alerts$ = this.alertService.autoAlerts$;

  /** Observable stream of unread alert count */
  unreadCount$ = this.alertService.unreadCount$;

  ngOnInit() {
    // Load alerts and unread count on component init
    this.alertService.loadAutoAlerts();
    this.alertService.loadUnreadCount();
  }

  /**
   * Mark all alerts as viewed/read
   * Reloads alerts and updates unread count after operation
   */
  markAllAsRead() {
    this.alertService.markAllAlertsAsViewed().subscribe(() => {
      this.alertService.loadAutoAlerts();
      this.alertService.loadUnreadCount();
    });
  }

  /**
   * Handle clicking on an alert
   * Marks alert as viewed if unread
   * Optionally navigates to coin detail page
   *
   * @param alert Alert that was clicked
   */
  handleAlertClick(alert: AutoAlert) {
    if (!alert.wasViewed) {
      this.alertService.markAlertAsViewed(alert.id).subscribe(() => {
        // Optimistic update - immediately update UI
        this.alertService.updateLocalAlertStatus(alert.id, true);
        this.alertService.loadUnreadCount();
      });
    }

    // Navigate to detail page if needed, or just close dropdown
    // For now, leave navigation commented out
    // this.router.navigate(['/market', alert.assetSymbol]);
  }
}
