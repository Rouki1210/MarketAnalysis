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
import { MarketAiService } from '../../../../core/services/market-ai.service';
import {
  MarketOverviewResponse,
  TopMover,
  MarketStatistics,
} from '../../../../core/models/market-overview.model';
import { Subject, takeUntil } from 'rxjs';

/**
 * MarketOverviewChatComponent
 *
 * AI-powered market overview chat interface
 *
 * Displays comprehensive AI analysis of cryptocurrency market:
 * - Overall market sentiment and trend (bullish/bearish/neutral)
 * - Market insights and key observations
 * - Top movers (biggest gainers/losers)
 * - Market statistics (total market cap, volume, dominance)
 * - Detailed sectoral performance
 *
 * Features:
 * - Modal overlay presentation
 * - Loading and error states
 * - Refresh functionality to get latest analysis
 * - Formatted numbers (T/B/M abbreviations)
 * - Colored trend indicators (green/red/gray)
 * - Icons for insights (✅/⚠️/ℹ️)
 * - Timestamp display
 *
 * Data Source:
 * - Fetches AI-generated market overview from Gemini API
 * - via MarketAiService
 *
 * Opened by clicking MarketAiButtonComponent on dashboard
 */
@Component({
  selector: 'app-market-overview-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './market-overview-chat.component.html',
  styleUrls: ['./market-overview-chat.component.css'],
})
export class MarketOverviewChatComponent
  implements OnInit, OnDestroy, OnChanges
{
  /** Controls modal visibility */
  @Input() isOpen: boolean = false;

  /** Emitted when modal should close */
  @Output() close = new EventEmitter<void>();

  /** AI-generated market analysis data */
  analysis: MarketOverviewResponse | null = null;

  /** Loading state indicator */
  loading = false;

  /** Error message if analysis fails */
  error: string | null = null;

  /** RxJS cleanup subject */
  private destroy$ = new Subject<void>();

  constructor(private marketAiService: MarketAiService) {}

  ngOnInit(): void {
    // Subscribe to service loading state
    this.marketAiService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    // Subscribe to service error state
    this.marketAiService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => (this.error = error));
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Load analysis when modal opens for first time
    if (changes['isOpen'] && this.isOpen && !this.analysis && !this.loading) {
      this.loadAnalysis();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load AI market overview analysis
   */
  loadAnalysis(): void {
    this.marketAiService.getMarketOverview().subscribe({
      next: (data) => {
        this.analysis = data;
      },
      error: (err) => {
        console.error('Error loading market overview:', err);
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
   */
  getInsightClass(type: string): string {
    return `insight-${type}`;
  }

  /**
   * Get CSS class for market trend badge
   * @param trend Market trend (bullish/bearish/neutral)
   */
  getTrendBadgeClass(trend: string): string {
    switch (trend) {
      case 'bullish':
        return 'trend-bullish';
      case 'bearish':
        return 'trend-bearish';
      default:
        return 'trend-neutral';
    }
  }

  /**
   * Get emoji icon for trend
   * @param trend Market trend
   */
  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'bullish':
        return '📈';
      case 'bearish':
        return '📉';
      default:
        return '➡️';
    }
  }

  /**
   * Format large numbers with abbreviations
   * @param num Number to format
   * @returns Formatted string (e.g., "$1.23T", "$456.78B")
   */
  formatNumber(num: number): string {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  }

  /**
   * Format percentage with + sign for positive values
   * @param num Percentage number
   */
  formatPercent(num: number): string {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  }

  /**
   * Format timestamp for display
   * @param dateString ISO date string
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
