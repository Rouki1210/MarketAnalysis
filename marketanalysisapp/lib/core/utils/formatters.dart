import 'package:intl/intl.dart';

/// Utility class for formatting numbers, currencies, and percentages
class Formatters {
  /// Format number with commas (e.g., 1,234,567)
  static String formatNumber(num value, {int decimals = 0}) {
    final formatter = NumberFormat(
      '#,##0${decimals > 0 ? '.${'0' * decimals}' : ''}',
      'en_US',
    );
    return formatter.format(value);
  }

  /// Format currency (e.g., $1,234.56)
  static String formatCurrency(
    num value, {
    int decimals = 2,
    String symbol = '\$',
  }) {
    final formatted = formatNumber(value, decimals: decimals);
    return '$symbol$formatted';
  }

  /// Format percentage (e.g., +5.25% or -3.14%)
  static String formatPercentage(
    num value, {
    int decimals = 2,
    bool includeSign = true,
  }) {
    final sign = includeSign && value >= 0 ? '+' : '';
    return '$sign${value.toStringAsFixed(decimals)}%';
  }

  /// Format large numbers with abbreviations (e.g., 1.5K, 2.3M, 1.2B, 3.4T)
  static String formatCompactNumber(num value, {int decimals = 2}) {
    if (value.abs() >= 1e12) {
      return '${(value / 1e12).toStringAsFixed(decimals)}T';
    } else if (value.abs() >= 1e9) {
      return '${(value / 1e9).toStringAsFixed(decimals)}B';
    } else if (value.abs() >= 1e6) {
      return '${(value / 1e6).toStringAsFixed(decimals)}M';
    } else if (value.abs() >= 1e3) {
      return '${(value / 1e3).toStringAsFixed(decimals)}K';
    }
    return value.toStringAsFixed(decimals);
  }

  /// Format market cap or volume (e.g., $1.5B)
  static String formatMarketCap(num value, {String symbol = '\$'}) {
    return '$symbol${formatCompactNumber(value)}';
  }

  /// Format date to readable string
  static String formatDate(DateTime date) {
    return DateFormat('MMM dd, yyyy').format(date);
  }

  /// Format date and time
  static String formatDateTime(DateTime dateTime) {
    return DateFormat('MMM dd, yyyy HH:mm').format(dateTime);
  }

  /// Format time ago (e.g., "2 hours ago")
  static String timeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 365) {
      return '${(difference.inDays / 365).floor()} year${(difference.inDays / 365).floor() == 1 ? '' : 's'} ago';
    } else if (difference.inDays > 30) {
      return '${(difference.inDays / 30).floor()} month${(difference.inDays / 30).floor() == 1 ? '' : 's'} ago';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} day${difference.inDays == 1 ? '' : 's'} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hour${difference.inHours == 1 ? '' : 's'} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minute${difference.inMinutes == 1 ? '' : 's'} ago';
    } else {
      return 'Just now';
    }
  }

  /// Format currency in compact form for charts (e.g., $1.2B)
  static String formatCompactCurrency(double value) {
    if (value >= 1e9) {
      return '\$${(value / 1e9).toStringAsFixed(2)}B';
    } else if (value >= 1e6) {
      return '\$${(value / 1e6).toStringAsFixed(2)}M';
    } else if (value >= 1e3) {
      return '\$${(value / 1e3).toStringAsFixed(2)}K';
    } else {
      return '\$${value.toStringAsFixed(2)}';
    }
  }

  /// Parse formatted currency string to number (e.g., "$1,234.56" -> 1234.56)
  static double parseCurrency(String value) {
    final cleaned = value.replaceAll(RegExp(r'[^\d.-]'), '');
    return double.tryParse(cleaned) ?? 0.0;
  }

  /// Parse percentage string to number (e.g., "+5.25%" -> 5.25)
  static double parsePercentage(String value) {
    final cleaned = value.replaceAll(RegExp(r'[^\d.-]'), '');
    return double.tryParse(cleaned) ?? 0.0;
  }
}
