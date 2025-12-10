import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../core/services/alert.service';
import { UserAlertResponseDto } from '../../../../core/models/user-alert.model';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

/**
 * AlertListComponent
 *
 * Displays and manages user's price alerts
 *
 * Features:
 * - Lists all user-created price alerts
 * - Delete alert functionality with confirmation
 * - Toggle alert active/inactive status
 * - Loading and error states
 * - Real-time alert status updates
 *
 * Used in ProfilePage under notifications tab
 */
@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './alert-list.component.html',
})
export class AlertListComponent implements OnInit {
  /** List of user's price alerts */
  alerts: UserAlertResponseDto[] = [];

  /** Loading state indicator */
  isLoading = false;

  /** Error message if alert loading fails */
  error: string | null = null;

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  /**
   * Load user's price alerts from backend
   */
  loadAlerts(): void {
    this.isLoading = true;
    this.alertService.getUserAlerts().subscribe({
      next: (data) => {
        this.alerts = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading alerts:', err);
        this.error = 'Failed to load alerts';
        this.isLoading = false;
      },
    });
  }

  /**
   * Delete a price alert
   * @param id Alert ID to delete
   */
  deleteAlert(id: number): void {
    if (confirm('Are you sure you want to delete this alert?')) {
      this.alertService.deleteUserAlert(id).subscribe({
        next: () => {
          // Remove from local list
          this.alerts = this.alerts.filter((a) => a.id !== id);
          alert('Alert deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting alert:', err);
          alert('Failed to delete alert');
        },
      });
    }
  }

  /**
   * Toggle alert active/inactive status
   * @param alertItem Alert to toggle
   */
  toggleActive(alertItem: UserAlertResponseDto): void {
    const newState = !alertItem.isActive;
    this.alertService.toggleAlertActive(alertItem.id, newState).subscribe({
      next: (updatedAlert) => {
        alertItem.isActive = updatedAlert.isActive;
      },
      error: (err) => {
        console.error('Error toggling alert:', err);
        alert('Failed to update alert status');
      },
    });
  }
}
