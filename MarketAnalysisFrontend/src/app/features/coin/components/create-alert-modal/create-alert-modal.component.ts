import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../core/services/alert.service';
import { CreateUserAlertDto } from '../../../../core/models/user-alert.model';
import { ApiService } from '../../../../core/services/api.service';
import { Coin } from '../../../../core/models/coin.model';

/**
 * CreateAlertModalComponent
 *
 * Modal dialog for creating price alerts
 *
 * Features:
 * - Select cryptocurrency from dropdown
 * - Choose alert type (ABOVE, BELOW, REACHES price)
 * - Set target price threshold
 * - Optional note for personal reference
 * - Repeating or one-time alert
 * - Form validation
 * - Error handling
 *
 * Can be pre-populated with asset ID and current price when opened
 * from a specific coin detail page
 */
@Component({
  selector: 'app-create-alert-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-alert-modal.component.html',
  styleUrls: ['./create-alert-modal.component.css'],
})
export class CreateAlertModalComponent implements OnInit {
  /** Controls modal visibility */
  @Input() isOpen = false;

  /** Pre-select specific asset (optional) */
  @Input() preSelectedAssetId?: number;

  /** Pre-select asset symbol for display (optional) */
  @Input() preSelectedSymbol?: string;

  /** Current price to show as reference (optional) */
  @Input() currentPrice?: number;

  /** Emitted when modal should close */
  @Output() close = new EventEmitter<void>();

  /** Emitted after alert successfully created */
  @Output() alertCreated = new EventEmitter<void>();

  /** List of available cryptocurrencies */
  coins: Coin[] = [];

  /** Selected asset ID */
  selectedAssetId?: number;

  /** Alert trigger condition */
  alertType: 'ABOVE' | 'BELOW' | 'REACHES' = 'ABOVE';

  /** Target price threshold */
  targetPrice?: number;

  /** If true, alert triggers multiple times */
  isRepeating = false;

  /** Optional user note */
  note = '';

  /** Form submission state */
  isSubmitting = false;

  /** Validation or API error message */
  error: string | null = null;

  constructor(
    private alertService: AlertService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Load available coins for dropdown
    this.apiService.coins$.subscribe((coins) => {
      this.coins = coins;
    });

    // Pre-select asset if provided
    if (this.preSelectedAssetId) {
      this.selectedAssetId = this.preSelectedAssetId;
    }
  }

  /**
   * Submit alert creation form
   * Validates input and creates alert via AlertService
   */
  onSubmit(): void {
    // Validate required fields
    if (!this.selectedAssetId || !this.targetPrice || this.targetPrice <= 0) {
      this.error = 'Please fill all required fields';
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const dto: CreateUserAlertDto = {
      assetId: this.selectedAssetId,
      alertType: this.alertType,
      targetPrice: this.targetPrice,
      isRepeating: this.isRepeating,
      note: this.note || undefined,
    };

    this.alertService.createUserAlert(dto).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.alertCreated.emit();
        this.closeModal();
        this.resetForm();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.error?.message || 'Failed to create alert';
      },
    });
  }

  /** Close modal without saving */
  closeModal(): void {
    this.close.emit();
  }

  /** Reset form to initial/pre-selected state */
  resetForm(): void {
    this.selectedAssetId = this.preSelectedAssetId;
    this.alertType = 'ABOVE';
    this.targetPrice = undefined;
    this.isRepeating = false;
    this.note = '';
    this.error = null;
  }

  /**
   * Prevent click events from bubbling to backdrop
   * (keeps modal open when clicking inside)
   */
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
