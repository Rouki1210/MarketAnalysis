import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiAnalysisService } from '../../../../core/services/ai-analysis.service';
import {
  CoinAnalysisResponse,
  Insight,
} from '../../../../core/models/ai-analysis.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-ai-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-analysis.component.html',
  styleUrls: ['./ai-analysis.component.css'],
})
export class AiAnalysisComponent implements OnInit, OnDestroy, OnChanges {
  @Input() symbol: string = '';
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  analysis: CoinAnalysisResponse | null = null;
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private aiService: AiAnalysisService) {}

  ngOnInit(): void {
    // Subscribe to loading and error states
    this.aiService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    this.aiService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => (this.error = error));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['isOpen'] &&
      this.isOpen &&
      this.symbol &&
      !this.analysis &&
      !this.loading
    ) {
      this.loadAnalysis();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnalysis(): void {
    if (!this.symbol) return;

    this.aiService.getAnalysis(this.symbol).subscribe({
      next: (data) => {
        this.analysis = data;
      },
      error: (err) => {
        console.error('Error loading AI analysis:', err);
      },
    });
  }

  refreshAnalysis(): void {
    this.analysis = null;
    this.loadAnalysis();
  }

  closeModal(): void {
    this.close.emit();
  }

  getInsightIcon(type: string): string {
    switch (type) {
      case 'positive':
        return '✅';
      case 'negative':
        return '⚠️';
      case 'neutral':
        return 'ℹ️';
      default:
        return '📊';
    }
  }

  getInsightClass(type: string): string {
    return `insight-${type}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
