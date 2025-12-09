/// Chart data models for price chart visualization

/// Model for line chart data point
class ChartPricePoint {
  final DateTime timestamp;
  final double price;

  ChartPricePoint({required this.timestamp, required this.price});

  factory ChartPricePoint.fromJson(Map<String, dynamic> json) {
    return ChartPricePoint(
      timestamp: DateTime.parse(json['timestampUtc'] ?? json['timestamp']),
      price: (json['price'] as num).toDouble(),
    );
  }
}

/// Model for OHLC candlestick data
class OhlcData {
  final String symbol;
  final DateTime periodStart;
  final double open;
  final double high;
  final double low;
  final double close;
  final double volume;

  OhlcData({
    required this.symbol,
    required this.periodStart,
    required this.open,
    required this.high,
    required this.low,
    required this.close,
    required this.volume,
  });

  factory OhlcData.fromJson(Map<String, dynamic> json) {
    return OhlcData(
      symbol: json['symbol'] ?? '',
      periodStart: DateTime.parse(json['periodStart']),
      open: (json['open'] as num).toDouble(),
      high: (json['high'] as num).toDouble(),
      low: (json['low'] as num).toDouble(),
      close: (json['close'] as num).toDouble(),
      volume: (json['volume'] as num).toDouble(),
    );
  }

  /// Check if this is a bullish (green) candle
  bool get isBullish => close >= open;
}

/// Timeframe helper for chart API
class ChartTimeframe {
  static const String oneHour = '1H';
  static const String oneDay = '24H';
  static const String sevenDays = '7D';
  static const String thirtyDays = '30D';
  static const String oneYear = '1Y';
  static const String all = 'ALL';

  /// Get API timeframe string from chart timeframe
  static String getApiTimeframe(String chartTimeframe) {
    switch (chartTimeframe) {
      case '1H':
        return '1h';
      case '24H':
        return '1h';
      case '7D':
      case '30D':
        return '1d';
      case '1Y':
      case 'ALL':
        return '1d';
      default:
        return '1d';
    }
  }

  /// Get date range from timeframe
  static DateRange getDateRange(String timeframe) {
    final now = DateTime.now().toUtc();
    DateTime from;

    switch (timeframe) {
      case '1H':
        from = now.subtract(const Duration(hours: 1));
        break;
      case '24H':
        from = now.subtract(const Duration(days: 1));
        break;
      case '7D':
        from = now.subtract(const Duration(days: 7));
        break;
      case '30D':
        from = now.subtract(const Duration(days: 30));
        break;
      case '1Y':
        from = now.subtract(const Duration(days: 365));
        break;
      case 'ALL':
        from = DateTime(2010, 1, 1); // Bitcoin genesis era
        break;
      default:
        from = now.subtract(const Duration(days: 7));
    }

    return DateRange(from: from, to: now);
  }
}

/// Date range helper
class DateRange {
  final DateTime from;
  final DateTime to;

  DateRange({required this.from, required this.to});
}
