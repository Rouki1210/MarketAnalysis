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
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  analysis: MarketOverviewResponse | null = null;
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private marketAiService: MarketAiService) {}

  ngOnInit(): void {
    this.marketAiService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => (this.loading = loading));

    this.marketAiService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => (this.error = error));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && !this.analysis && !this.loading) {
      this.loadAnalysis();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  formatNumber(num: number): string {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  }

  formatPercent(num: number): string {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  }

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
