/// Market overview model
class MarketOverview {
  final double totalMarketCap;
  final double totalMarketCapChange24h;
  final double totalVolume24h;
  final double totalVolume24hChange24h;
  final double btcDominance;
  final double ethDominance;
  final double btcDominanceChange;
  final double ethDominanceChange;
  final int fearGreedIndex;
  final String fearGreedText;

  MarketOverview({
    required this.totalMarketCap,
    required this.totalMarketCapChange24h,
    required this.totalVolume24h,
    required this.totalVolume24hChange24h,
    required this.btcDominance,
    required this.ethDominance,
    required this.btcDominanceChange,
    required this.ethDominanceChange,
    required this.fearGreedIndex,
    required this.fearGreedText,
  });

  factory MarketOverview.fromJson(Map<String, dynamic> json) {
    return MarketOverview(
      totalMarketCap: (json['total_market_cap_usd'] as num?)?.toDouble() ?? 0.0,
      totalMarketCapChange24h:
          (json['total_market_cap_percent_change_24h'] as num?)?.toDouble() ??
          0.0,
      totalVolume24h: (json['total_volume_24h'] as num?)?.toDouble() ?? 0.0,
      totalVolume24hChange24h:
          (json['total_volume_24h_percent_change_24h'] as num?)?.toDouble() ??
          0.0,
      btcDominance:
          (json['bitcoin_dominance_price'] as num?)?.toDouble() ?? 0.0,
      ethDominance:
          (json['ethereum_dominance_price'] as num?)?.toDouble() ?? 0.0,
      btcDominanceChange:
          (json['bitcoin_dominance_percentage'] as num?)?.toDouble() ?? 0.0,
      ethDominanceChange:
          (json['ethereum_dominance_percentage'] as num?)?.toDouble() ?? 0.0,
      fearGreedIndex: json['fear_and_greed_index'] as int? ?? 50,
      fearGreedText: json['fear_and_greed_text'] as String? ?? 'Neutral',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'total_market_cap_usd': totalMarketCap,
      'total_market_cap_percent_change_24h': totalMarketCapChange24h,
      'total_volume_24h': totalVolume24h,
      'total_volume_24h_percent_change_24h': totalVolume24hChange24h,
      'bitcoin_dominance_price': btcDominance,
      'ethereum_dominance_price': ethDominance,
      'bitcoin_dominance_percentage': btcDominanceChange,
      'ethereum_dominance_percentage': ethDominanceChange,
      'fear_and_greed_index': fearGreedIndex,
      'fear_and_greed_text': fearGreedText,
    };
  }
}

/// Chart data point model
class ChartDataPoint {
  final DateTime time;
  final double value;

  ChartDataPoint({required this.time, required this.value});

  factory ChartDataPoint.fromJson(Map<String, dynamic> json) {
    return ChartDataPoint(
      time: DateTime.parse(json['time'] as String),
      value: (json['price'] as num? ?? json['value'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {'time': time.toIso8601String(), 'value': value};
  }
}
