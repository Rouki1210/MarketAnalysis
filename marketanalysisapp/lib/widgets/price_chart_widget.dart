import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../models/asset_model.dart' show Coin;
import '../models/chart_data_model.dart';
import '../repositories/chart_repository.dart';
import '../core/theme/app_colors.dart';
import '../core/utils/formatters.dart';

/// Chart type enum
enum ChartType { line, candlestick }

/// Advanced Price Chart Widget with line and candlestick modes
class PriceChartWidget extends StatefulWidget {
  final Coin coin;
  final String timeframe;
  final double height;

  const PriceChartWidget({
    super.key,
    required this.coin,
    required this.timeframe,
    this.height = 300,
  });

  @override
  State<PriceChartWidget> createState() => _PriceChartWidgetState();
}

class _PriceChartWidgetState extends State<PriceChartWidget> {
  final ChartRepository _chartRepository = ChartRepository();

  ChartType _chartType = ChartType.line;
  List<OhlcData> _ohlcData = [];
  List<ChartPricePoint> _priceData = [];
  bool _isLoading = true;
  String? _error;
  int? _touchedIndex;

  @override
  void initState() {
    super.initState();
    _loadChartData();
  }

  @override
  void didUpdateWidget(PriceChartWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.timeframe != widget.timeframe ||
        oldWidget.coin.symbol != widget.coin.symbol) {
      _loadChartData();
    }
  }

  Future<void> _loadChartData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final dateRange = ChartTimeframe.getDateRange(widget.timeframe);

      if (_chartType == ChartType.candlestick) {
        final data = await _chartRepository.getOhlcData(
          widget.coin.symbol,
          widget.timeframe,
          from: dateRange.from,
          to: dateRange.to,
        );
        setState(() {
          _ohlcData = data;
          _isLoading = false;
        });
      } else {
        final data = await _chartRepository.getPriceData(
          widget.coin.symbol,
          from: dateRange.from,
          to: dateRange.to,
        );
        setState(() {
          _priceData = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Failed to load chart data';
        _isLoading = false;
      });
      // Fallback to sample data if API fails
      _generateFallbackData();
    }
  }

  void _generateFallbackData() {
    final points = _getDataPointCount();
    final currentPrice = widget.coin.price;
    final changePercent = _getChangeForTimeframe();

    if (currentPrice == 0) return;

    final startPrice = currentPrice / (1 + changePercent / 100);
    final priceRange = currentPrice - startPrice;

    if (_chartType == ChartType.line) {
      final List<ChartPricePoint> spots = [];
      final now = DateTime.now().toUtc();

      for (int i = 0; i < points; i++) {
        final progress = i / (points - 1);
        final volatility = (i % 3 - 1) * 0.02;
        final value =
            startPrice + (priceRange * progress) + (currentPrice * volatility);
        final timestamp = now.subtract(Duration(hours: (points - 1 - i)));
        spots.add(ChartPricePoint(timestamp: timestamp, price: value));
      }

      setState(() {
        _priceData = spots;
        _isLoading = false;
        _error = null;
      });
    } else {
      final List<OhlcData> candles = [];
      final now = DateTime.now().toUtc();

      for (int i = 0; i < points; i++) {
        final progress = i / (points - 1);
        final basePrice = startPrice + (priceRange * progress);
        final volatilityFactor = 0.02;

        final open =
            basePrice *
            (1 + (i % 2 == 0 ? -volatilityFactor : volatilityFactor));
        final close =
            basePrice *
            (1 + (i % 2 == 0 ? volatilityFactor : -volatilityFactor));
        final high =
            [open, close].reduce((a, b) => a > b ? a : b) *
            (1 + volatilityFactor * 0.5);
        final low =
            [open, close].reduce((a, b) => a < b ? a : b) *
            (1 - volatilityFactor * 0.5);

        final timestamp = now.subtract(Duration(hours: (points - 1 - i)));
        candles.add(
          OhlcData(
            symbol: widget.coin.symbol,
            periodStart: timestamp,
            open: open,
            high: high,
            low: low,
            close: close,
            volume: 1000000,
          ),
        );
      }

      setState(() {
        _ohlcData = candles;
        _isLoading = false;
        _error = null;
      });
    }
  }

  int _getDataPointCount() {
    switch (widget.timeframe) {
      case '1H':
        return 60;
      case '24H':
        return 24;
      case '7D':
        return 28;
      case '30D':
        return 30;
      case '1Y':
        return 52;
      case 'ALL':
        return 100;
      default:
        return 24;
    }
  }

  double _getChangeForTimeframe() {
    switch (widget.timeframe) {
      case '1H':
        return widget.coin.change1h;
      case '7D':
        return widget.coin.change7d;
      case '24H':
      default:
        return widget.coin.change24h;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Chart Type Toggle
        _buildChartTypeToggle(),
        const SizedBox(height: 8),

        // Chart Container - use Expanded to fill remaining space
        Expanded(child: _buildChartContent()),

        // Tooltip
        if (_touchedIndex != null) _buildTooltip(),
      ],
    );
  }

  Widget _buildChartTypeToggle() {
    return Row(
      children: [
        _buildToggleButton('Price', ChartType.line, Icons.show_chart),
        const SizedBox(width: 8),
        _buildToggleButton(
          'Candlestick',
          ChartType.candlestick,
          Icons.candlestick_chart,
        ),
      ],
    );
  }

  Widget _buildToggleButton(String label, ChartType type, IconData icon) {
    final isSelected = _chartType == type;
    return GestureDetector(
      onTap: () {
        setState(() {
          _chartType = type;
          _touchedIndex = null;
        });
        _loadChartData();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primaryAccent.withOpacity(0.2)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? AppColors.primaryAccent : AppColors.border,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 16,
              color: isSelected
                  ? AppColors.primaryAccent
                  : AppColors.textSecondary,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                color: isSelected
                    ? AppColors.primaryAccent
                    : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChartContent() {
    if (_isLoading) {
      return _buildLoadingState();
    }

    if (_error != null) {
      return _buildErrorState();
    }

    if (_chartType == ChartType.candlestick) {
      return _buildCandlestickChart();
    } else {
      return _buildLineChart();
    }
  }

  Widget _buildLoadingState() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBackground.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 32,
              height: 32,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(
                  AppColors.primaryAccent,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Loading chart data...',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBackground.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, color: AppColors.error, size: 40),
            const SizedBox(height: 12),
            Text(
              _error ?? 'An error occurred',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _loadChartData,
              icon: const Icon(Icons.refresh, size: 16),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryAccent,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 10,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLineChart() {
    if (_priceData.isEmpty) {
      return _buildEmptyState();
    }

    final spots = _priceData.asMap().entries.map((e) {
      return FlSpot(e.key.toDouble(), e.value.price);
    }).toList();

    if (spots.isEmpty) return _buildEmptyState();

    final isPositive = widget.coin.change24h >= 0;
    final lineColor = isPositive ? AppColors.chartGreen : AppColors.chartRed;

    final minY = spots.map((e) => e.y).reduce((a, b) => a < b ? a : b) * 0.98;
    final maxY = spots.map((e) => e.y).reduce((a, b) => a > b ? a : b) * 1.02;

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: (maxY - minY) / 4,
          getDrawingHorizontalLine: (value) {
            return FlLine(
              color: AppColors.border.withOpacity(0.2),
              strokeWidth: 1,
            );
          },
        ),
        titlesData: FlTitlesData(
          show: true,
          rightTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          topTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              interval: (spots.length / 4).ceilToDouble(),
              getTitlesWidget: (value, meta) {
                final index = value.toInt();
                if (index < 0 || index >= _priceData.length) {
                  return const SizedBox.shrink();
                }
                return Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(
                    _formatTimeLabel(_priceData[index].timestamp),
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 10,
                    ),
                  ),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 55,
              getTitlesWidget: (value, meta) {
                return Text(
                  Formatters.formatCompactCurrency(value),
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 10,
                  ),
                );
              },
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        minX: 0,
        maxX: (spots.length - 1).toDouble(),
        minY: minY,
        maxY: maxY,
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            curveSmoothness: 0.3,
            color: lineColor,
            barWidth: 2,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  lineColor.withOpacity(0.3),
                  lineColor.withOpacity(0.05),
                ],
              ),
            ),
          ),
        ],
        lineTouchData: LineTouchData(
          enabled: true,
          touchTooltipData: LineTouchTooltipData(
            tooltipPadding: const EdgeInsets.all(8),
            tooltipMargin: 10,
            getTooltipItems: (touchedSpots) {
              return touchedSpots.map((spot) {
                final index = spot.x.toInt();
                final timestamp = index < _priceData.length
                    ? _priceData[index].timestamp
                    : DateTime.now();
                return LineTooltipItem(
                  '${_formatDateTime(timestamp)}\n${Formatters.formatCurrency(spot.y)}',
                  const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                );
              }).toList();
            },
          ),
          handleBuiltInTouches: true,
          touchCallback: (event, response) {
            if (event is FlTapUpEvent || event is FlLongPressEnd) {
              setState(() {
                _touchedIndex = null;
              });
            } else if (response?.lineBarSpots != null &&
                response!.lineBarSpots!.isNotEmpty) {
              setState(() {
                _touchedIndex = response.lineBarSpots!.first.x.toInt();
              });
            }
          },
        ),
      ),
    );
  }

  Widget _buildCandlestickChart() {
    if (_ohlcData.isEmpty) {
      return _buildEmptyState();
    }

    // Calculate min/max for scaling
    final allPrices = _ohlcData.expand((c) => [c.high, c.low]).toList();
    final minY = allPrices.reduce((a, b) => a < b ? a : b) * 0.98;
    final maxY = allPrices.reduce((a, b) => a > b ? a : b) * 1.02;

    return CustomPaint(
      painter: CandlestickChartPainter(
        data: _ohlcData,
        minPrice: minY,
        maxPrice: maxY,
        touchedIndex: _touchedIndex,
        greenColor: AppColors.chartGreen,
        redColor: AppColors.chartRed,
        gridColor: AppColors.border.withOpacity(0.2),
        textColor: AppColors.textSecondary,
      ),
      child: GestureDetector(
        onTapDown: (details) {
          final index = _getIndexFromPosition(details.localPosition);
          setState(() {
            _touchedIndex = index;
          });
        },
        onTapUp: (_) {
          Future.delayed(const Duration(seconds: 2), () {
            if (mounted) {
              setState(() {
                _touchedIndex = null;
              });
            }
          });
        },
        onPanUpdate: (details) {
          final index = _getIndexFromPosition(details.localPosition);
          setState(() {
            _touchedIndex = index;
          });
        },
      ),
    );
  }

  int _getIndexFromPosition(Offset position) {
    if (_ohlcData.isEmpty) return 0;
    final width = context.size?.width ?? 300;
    final candleWidth = width / _ohlcData.length;
    return (position.dx / candleWidth).clamp(0, _ohlcData.length - 1).toInt();
  }

  Widget _buildTooltip() {
    if (_touchedIndex == null) return const SizedBox.shrink();

    if (_chartType == ChartType.candlestick &&
        _touchedIndex! < _ohlcData.length) {
      final candle = _ohlcData[_touchedIndex!];
      return Container(
        margin: const EdgeInsets.only(top: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.cardBackground,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _formatDateTime(candle.periodStart),
              style: TextStyle(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildTooltipItem('O', candle.open, Colors.white),
                const SizedBox(width: 16),
                _buildTooltipItem('H', candle.high, AppColors.chartGreen),
                const SizedBox(width: 16),
                _buildTooltipItem('L', candle.low, AppColors.chartRed),
                const SizedBox(width: 16),
                _buildTooltipItem('C', candle.close, Colors.white),
              ],
            ),
          ],
        ),
      );
    }

    return const SizedBox.shrink();
  }

  Widget _buildTooltipItem(String label, double value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(color: AppColors.textSecondary, fontSize: 10),
        ),
        Text(
          Formatters.formatCurrency(value),
          style: TextStyle(
            color: color,
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardBackground.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Text(
          'No chart data available',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
        ),
      ),
    );
  }

  String _formatTimeLabel(DateTime timestamp) {
    switch (widget.timeframe) {
      case '1H':
        return '${timestamp.minute}m';
      case '24H':
        return '${timestamp.hour}:00';
      case '7D':
        final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days[timestamp.weekday - 1];
      case '30D':
        return '${timestamp.day}';
      case '1Y':
        final months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        return months[timestamp.month - 1];
      default:
        return '${timestamp.hour}:00';
    }
  }

  String _formatDateTime(DateTime timestamp) {
    return '${timestamp.day}/${timestamp.month} ${timestamp.hour.toString().padLeft(2, '0')}:${timestamp.minute.toString().padLeft(2, '0')}';
  }
}

/// Custom painter for candlestick chart
class CandlestickChartPainter extends CustomPainter {
  final List<OhlcData> data;
  final double minPrice;
  final double maxPrice;
  final int? touchedIndex;
  final Color greenColor;
  final Color redColor;
  final Color gridColor;
  final Color textColor;

  CandlestickChartPainter({
    required this.data,
    required this.minPrice,
    required this.maxPrice,
    this.touchedIndex,
    required this.greenColor,
    required this.redColor,
    required this.gridColor,
    required this.textColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    final leftPadding = 50.0;
    final bottomPadding = 30.0;
    final chartWidth = size.width - leftPadding;
    final chartHeight = size.height - bottomPadding;

    // Draw grid lines
    _drawGrid(canvas, size, leftPadding, bottomPadding, chartHeight);

    // Calculate candle dimensions
    final candleWidth = chartWidth / data.length;
    final bodyWidth = candleWidth * 0.6;
    final priceRange = maxPrice - minPrice;

    for (int i = 0; i < data.length; i++) {
      final candle = data[i];
      final isBullish = candle.close >= candle.open;
      final color = isBullish ? greenColor : redColor;

      // Calculate positions
      final x = leftPadding + (i * candleWidth) + (candleWidth / 2);
      final openY =
          chartHeight - ((candle.open - minPrice) / priceRange * chartHeight);
      final closeY =
          chartHeight - ((candle.close - minPrice) / priceRange * chartHeight);
      final highY =
          chartHeight - ((candle.high - minPrice) / priceRange * chartHeight);
      final lowY =
          chartHeight - ((candle.low - minPrice) / priceRange * chartHeight);

      // Draw wick
      final wickPaint = Paint()
        ..color = color
        ..strokeWidth = 1;
      canvas.drawLine(Offset(x, highY), Offset(x, lowY), wickPaint);

      // Draw body
      final bodyPaint = Paint()
        ..color = color
        ..style = isBullish ? PaintingStyle.stroke : PaintingStyle.fill
        ..strokeWidth = 1;

      final bodyTop = isBullish ? closeY : openY;
      final bodyBottom = isBullish ? openY : closeY;
      final bodyHeight = (bodyBottom - bodyTop).abs().clamp(1.0, chartHeight);

      canvas.drawRect(
        Rect.fromLTWH(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight),
        bodyPaint,
      );

      // Highlight touched candle
      if (touchedIndex == i) {
        final highlightPaint = Paint()
          ..color = color.withOpacity(0.3)
          ..style = PaintingStyle.fill;
        canvas.drawRect(
          Rect.fromLTWH(
            leftPadding + (i * candleWidth),
            0,
            candleWidth,
            chartHeight,
          ),
          highlightPaint,
        );
      }
    }
  }

  void _drawGrid(
    Canvas canvas,
    Size size,
    double leftPadding,
    double bottomPadding,
    double chartHeight,
  ) {
    final gridPaint = Paint()
      ..color = gridColor
      ..strokeWidth = 1;

    // Horizontal grid lines
    for (int i = 0; i <= 4; i++) {
      final y = (chartHeight / 4) * i;
      canvas.drawLine(Offset(leftPadding, y), Offset(size.width, y), gridPaint);

      // Price labels
      final price = maxPrice - ((maxPrice - minPrice) / 4 * i);
      final textSpan = TextSpan(
        text: _formatPrice(price),
        style: TextStyle(color: textColor, fontSize: 10),
      );
      final textPainter = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
      )..layout();
      textPainter.paint(canvas, Offset(4, y - 6));
    }
  }

  String _formatPrice(double price) {
    if (price >= 1000) {
      return '\$${(price / 1000).toStringAsFixed(1)}K';
    } else if (price >= 1) {
      return '\$${price.toStringAsFixed(2)}';
    } else {
      return '\$${price.toStringAsFixed(4)}';
    }
  }

  @override
  bool shouldRepaint(covariant CandlestickChartPainter oldDelegate) {
    return data != oldDelegate.data || touchedIndex != oldDelegate.touchedIndex;
  }
}
