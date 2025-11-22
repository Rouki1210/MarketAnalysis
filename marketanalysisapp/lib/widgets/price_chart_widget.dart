import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../models/asset_model.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';

class PriceChartWidget extends StatelessWidget {
  final Coin coin;
  final String timeframe;

  const PriceChartWidget({
    super.key,
    required this.coin,
    required this.timeframe,
  });

  @override
  Widget build(BuildContext context) {
    // Generate sample data points (in real app, fetch from API)
    final dataPoints = _generateSampleData();

    if (dataPoints.isEmpty) {
      return Center(
        child: Text(
          'No chart data available',
          style: TextStyle(color: AppColors.textSecondary),
        ),
      );
    }

    final isPositive = coin.change24h >= 0;
    final lineColor = isPositive ? AppColors.success : AppColors.error;

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: null,
          getDrawingHorizontalLine: (value) {
            return FlLine(
              color: AppColors.border.withOpacity(0.1),
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
              interval: dataPoints.length / 5,
              getTitlesWidget: (value, meta) {
                if (value == value.toInt()) {
                  return Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: Text(
                      _getTimeLabel(value.toInt(), dataPoints.length),
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 10,
                      ),
                    ),
                  );
                }
                return const SizedBox.shrink();
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 50,
              interval: null,
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
        maxX: (dataPoints.length - 1).toDouble(),
        minY: dataPoints.map((e) => e.y).reduce((a, b) => a < b ? a : b) * 0.98,
        maxY: dataPoints.map((e) => e.y).reduce((a, b) => a > b ? a : b) * 1.02,
        lineBarsData: [
          LineChartBarData(
            spots: dataPoints,
            isCurved: true,
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
                  lineColor.withOpacity(0.0),
                ],
              ),
            ),
          ),
        ],
        lineTouchData: LineTouchData(
          enabled: true,
          touchTooltipData: LineTouchTooltipData(
            getTooltipItems: (touchedSpots) {
              return touchedSpots.map((spot) {
                return LineTooltipItem(
                  Formatters.formatCurrency(spot.y),
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
        ),
      ),
    );
  }

  /// Generate sample data points based on current price and change
  List<FlSpot> _generateSampleData() {
    final int points = _getDataPointCount();
    final currentPrice = coin.price;
    final changePercent = _getChangeForTimeframe();

    if (currentPrice == 0) return [];

    final startPrice = currentPrice / (1 + changePercent / 100);
    final priceRange = currentPrice - startPrice;

    final List<FlSpot> spots = [];
    for (int i = 0; i < points; i++) {
      // Create a somewhat realistic price movement
      final progress = i / (points - 1);
      final volatility = (i % 3 - 1) * 0.02; // Small random-ish movements
      final value =
          startPrice + (priceRange * progress) + (currentPrice * volatility);
      spots.add(FlSpot(i.toDouble(), value));
    }

    // Ensure last point is exactly current price
    if (spots.isNotEmpty) {
      spots[spots.length - 1] = FlSpot((points - 1).toDouble(), currentPrice);
    }

    return spots;
  }

  int _getDataPointCount() {
    switch (timeframe) {
      case '1H':
        return 60; // 60 minute intervals
      case '24H':
        return 24; // 24 hour intervals
      case '7D':
        return 7 * 4; // 4 points per day
      case '30D':
        return 30;
      case '1Y':
        return 52; // Weekly
      case 'ALL':
        return 100;
      default:
        return 24;
    }
  }

  double _getChangeForTimeframe() {
    switch (timeframe) {
      case '1H':
        return coin.change1h;
      case '7D':
        return coin.change7d;
      case '24H':
      default:
        return coin.change24h;
    }
  }

  String _getTimeLabel(int index, int total) {
    switch (timeframe) {
      case '1H':
        return '${index * (60 ~/ total)}m';
      case '24H':
        if (index == 0) return '00:00';
        if (index == total - 1) return 'Now';
        return '${index * (24 ~/ total)}:00';
      case '7D':
        final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days[index % 7];
      case '30D':
        return '${index + 1}';
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
        return months[index % 12];
      default:
        return '';
    }
  }
}
