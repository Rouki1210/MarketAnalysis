import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../core/services/alert.service';
import { CreateUserAlertDto } from '../../../../core/models/user-alert.model';
import { ApiService } from '../../../../core/services/api.service';
import { Coin } from '../../../../core/models/coin.model';

@Component({
  selector: 'app-create-alert-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-alert-modal.component.html',
  styleUrls: ['./create-alert-modal.component.css'],
})
export class CreateAlertModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() preSelectedAssetId?: number;
  @Input() preSelectedSymbol?: string;
  @Input() currentPrice?: number;
  @Output() close = new EventEmitter<void>();
  @Output() alertCreated = new EventEmitter<void>();

  coins: Coin[] = [];
  selectedAssetId?: number;
  alertType: 'ABOVE' | 'BELOW' | 'REACHES' = 'ABOVE';
  targetPrice?: number;
  isRepeating = false;
  note = '';
  isSubmitting = false;
  error: string | null = null;

  constructor(
    private alertService: AlertService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Load coins for the select
    this.apiService.coins$.subscribe((coins) => {
      this.coins = coins;
    });

    // If pre-selected, set it
    if (this.preSelectedAssetId) {
      this.selectedAssetId = this.preSelectedAssetId;
    }
  }

  onSubmit(): void {
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

  closeModal(): void {
    this.close.emit();
  }

  resetForm(): void {
    this.selectedAssetId = this.preSelectedAssetId;
    this.alertType = 'ABOVE';
    this.targetPrice = undefined;
    this.isRepeating = false;
    this.note = '';
    this.error = null;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
