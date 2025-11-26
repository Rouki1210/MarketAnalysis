import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ChartService } from '../../../../core/services/chart.service';
import { ChartTimeframe } from '../../../../core/models/common.model';
import { CreateAlertModalComponent } from '../create-alert-modal/create-alert-modal.component';
import { ApiService } from '../../../../core/services/api.service';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  HistogramData,
  UTCTimestamp,
  CrosshairMode,
} from 'lightweight-charts';
import { Subject, takeUntil } from 'rxjs';

interface TooltipData {
  time: string;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume?: number;
}

@Component({
  selector: 'app-price-chart',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    ButtonComponent,
    CreateAlertModalComponent,
  ],
  templateUrl: './price-chart.component.html',
  styleUrls: ['./price-chart.component.css'],
})
export class PriceChartComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() symbol!: string;
  @Input() assetId?: number;
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  private chart?: IChartApi;
  private candlestickSeries?: ISeriesApi<'Candlestick'>;
  private lineSeries?: ISeriesApi<'Line'>;
  private volumeSeries?: ISeriesApi<'Histogram'>;
  private destroy$ = new Subject<void>();

  selectedTimeframe: ChartTimeframe = '1D';
  timeframes: ChartTimeframe[] = ['1D', '7D', '1M', '3M', '1Y', 'ALL'];
  selectedChartType: 'candlestick' | 'line' = 'candlestick';
  isLoading = false;
  error: string | null = null;
  tooltipData: TooltipData | null = null;
  showTooltip = false;
  isAlertModalOpen = false;
  currentPrice?: number;

  constructor(
    private chartService: ChartService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Asset ID is now passed as input
  }

  ngAfterViewInit(): void {
    this.initChart();
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.loadChartData();
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chart) {
      this.chart.remove();
    }
  }

  private initChart(): void {
    if (!this.chartContainer) return;

    const container = this.chartContainer.nativeElement;
    this.chart = createChart(container, {
      width: container.clientWidth,
      height: 500,
      layout: {
        background: { color: '#1a1d28' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: 'rgba(224, 227, 235, 0.3)',
          style: 2,
        },
        horzLine: {
          width: 1,
          color: 'rgba(224, 227, 235, 0.3)',
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: '#374151',
        scaleMargins: {
          top: 0.1,
          bottom: 0.25,
        },
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    // Subscribe to crosshair move for tooltip
    this.chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point) {
        this.showTooltip = false;
        return;
      }

      const series =
        this.selectedChartType === 'candlestick'
          ? this.candlestickSeries
          : this.lineSeries;
      if (!series) return;

      const data = param.seriesData.get(series) as any;
      if (data) {
        const time = new Date((param.time as number) * 1000);
        this.tooltipData = {
          time: time.toLocaleString(),
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close || data.value,
        };
        this.showTooltip = true;
      }
    });

    // Handle window resize
    const resizeObserver = new ResizeObserver((entries) => {
      if (this.chart && entries.length > 0) {
        const { width } = entries[0].contentRect;
        this.chart.applyOptions({ width });
      }
    });
    resizeObserver.observe(container);
  }

  loadChartData(): void {
    if (!this.chart || !this.symbol) return;

    this.isLoading = true;
    const { from, to } = this.chartService.getDateRangeFromTimeframe(
      this.selectedTimeframe
    );
    const apiTimeframe = this.chartService.getAPITimeframe(
      this.selectedTimeframe
    );

    if (this.selectedChartType === 'candlestick') {
      this.loadCandlestickData(apiTimeframe, from, to);
    } else {
      this.loadLineData(from, to);
    }
  }

  private loadCandlestickData(timeframe: string, from: Date, to: Date): void {
    // Remove existing series
    if (this.lineSeries) {
      this.chart?.removeSeries(this.lineSeries);
      this.lineSeries = undefined;
    }
    if (this.volumeSeries) {
      this.chart?.removeSeries(this.volumeSeries);
      this.volumeSeries = undefined;
    }

    // Create or reuse candlestick series
    if (!this.candlestickSeries && this.chart) {
      this.candlestickSeries = this.chart.addCandlestickSeries({
        upColor: '#10B981',
        downColor: '#EF4444',
        borderVisible: false,
        wickUpColor: '#10B981',
        wickDownColor: '#EF4444',
      });
    }

    // Create volume series
    if (!this.volumeSeries && this.chart) {
      this.volumeSeries = this.chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
      });

      // Configure volume scale
      this.chart.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
    }

    this.chartService
      .getOHLCData(this.symbol, timeframe, from, to)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (!data || data.length === 0) {
            this.error = 'No data available for this timeframe';
            this.isLoading = false;
            return;
          }

          const candlestickData: CandlestickData[] = data
            .map((item) => ({
              time: (new Date(item.periodStart).getTime() /
                1000) as UTCTimestamp,
              open: Number(item.open),
              high: Number(item.high),
              low: Number(item.low),
              close: Number(item.close),
            }))
            .sort((a, b) => (a.time as number) - (b.time as number));

          const volumeData: HistogramData[] = data
            .map((item) => ({
              time: (new Date(item.periodStart).getTime() /
                1000) as UTCTimestamp,
              value: Number(item.volume),
              color:
                item.close >= item.open
                  ? 'rgba(16, 185, 129, 0.3)'
                  : 'rgba(239, 68, 68, 0.3)',
            }))
            .sort((a, b) => (a.time as number) - (b.time as number));

          if (this.candlestickSeries) {
            this.candlestickSeries.setData(candlestickData);
          }
          if (this.volumeSeries) {
            this.volumeSeries.setData(volumeData);
          }

          this.chart?.timeScale().fitContent();
          this.error = null;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading candlestick data:', err);
          this.error = 'Failed to load chart data';
          this.isLoading = false;
        },
      });
  }

  private loadLineData(from: Date, to: Date): void {
    // Remove existing series
    if (this.candlestickSeries) {
      this.chart?.removeSeries(this.candlestickSeries);
      this.candlestickSeries = undefined;
    }
    if (this.volumeSeries) {
      this.chart?.removeSeries(this.volumeSeries);
      this.volumeSeries = undefined;
    }

    // Create or reuse line series
    if (!this.lineSeries && this.chart) {
      this.lineSeries = this.chart.addLineSeries({
        color: '#3B82F6',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 6,
        lastValueVisible: true,
        priceLineVisible: true,
      });
    }

    this.chartService
      .getPriceData(this.symbol, from, to)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (!data || data.length === 0) {
            this.error = 'No data available for this timeframe';
            this.isLoading = false;
            return;
          }

          const lineData: LineData[] = data
            .map((item) => ({
              time: (new Date(item.timestamp).getTime() / 1000) as UTCTimestamp,
              value: Number(item.price),
            }))
            .sort((a, b) => (a.time as number) - (b.time as number));

          if (this.lineSeries) {
            this.lineSeries.setData(lineData);
          }

          this.chart?.timeScale().fitContent();
          this.error = null;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading line data:', err);
          this.error = 'Failed to load chart data';
          this.isLoading = false;
        },
      });
  }

  selectTimeframe(timeframe: ChartTimeframe): void {
    this.selectedTimeframe = timeframe;
    this.loadChartData();
  }

  toggleChartType(): void {
    this.selectedChartType =
      this.selectedChartType === 'line' ? 'candlestick' : 'line';
    this.loadChartData();
  }

  openAlertModal(): void {
    this.isAlertModalOpen = true;
  }

  closeAlertModal(): void {
    this.isAlertModalOpen = false;
  }

  onAlertCreated(): void {
    alert('Alert created successfully!');
    // Alert created successfully (notification handled by modal)
  }
}
