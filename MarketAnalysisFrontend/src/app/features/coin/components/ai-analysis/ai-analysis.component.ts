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

/**
 * AiAnalysisComponent
 *
 * Modal displaying AI-powered cryptocurrency analysis
 *
 * Features:
 * - Fetches AI analysis from Gemini API via AiAnalysisService
 * - Displays insights categorized as positive, negative, or neutral
 * - Shows current price and 7-day change
 * - Loading and error states
 * - Refresh analysis functionality
 * - Icon indicators for insight types
 * - Formatted timestamp display
 *
 * Analysis includes:
 * - Technical analysis insights
 * - Fundamental analysis
 * - Sentiment indicators
 * - Market trends
 */
@Component({
  selector: 'app-ai-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-analysis.component.html',
  styleUrls: ['./ai-analysis.component.css'],
})
export class AiAnalysisComponent implements OnInit, OnDestroy, OnChanges {
  /** Cryptocurrency symbol to analyze */
  @Input() symbol: string = '';

  /** Controls modal visibility */
  @Input() isOpen: boolean = false;

  /** Emitted when modal should close */
  @Output() close = new EventEmitter<void>();

  /** AI analysis response data */
  analysis: CoinAnalysisResponse | null = null;

  /** Loading state indicator */
  loading = false;

  /** Error message if analysis fails */
  error: string | null = null;

  /** RxJS cleanup subject */
  private destroy$ = new Subject<void>();

  constructor(private aiService: AiAnalysisService) {}

  ngOnInit(): void {
    // Subscribe to service loading state
    this.aiService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    // Subscribe to service error state
    this.aiService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => (this.error = error));
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Load analysis when modal opens for first time
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

  /**
   * Load AI analysis for current symbol
   */
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

  /**
   * Refresh analysis (fetch new data)
   */
  refreshAnalysis(): void {
    this.analysis = null;
    this.loadAnalysis();
  }

  /** Close modal */
  closeModal(): void {
    this.close.emit();
  }

  /**
   * Get emoji icon for insight type
   * @param type Insight type (positive/negative/neutral)
   * @returns Emoji string
   */
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

  /**
   * Get CSS class for insight type
   * @param type Insight type
   * @returns CSS class name
   */
  getInsightClass(type: string): string {
    return `insight-${type}`;
  }

  /**
   * Format timestamp for display
   * @param dateString ISO date string
   * @returns Formatted date/time string (Vietnamese locale)
   */
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
