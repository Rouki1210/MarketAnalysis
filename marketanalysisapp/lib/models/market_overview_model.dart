class MarketOverviewResponse {
  final DateTime analyzedAt;
  final String overallTrend;
  final List<Insight> insights;
  final List<TopMover> topGainers;
  final List<TopMover> topLosers;
  final MarketStatistics statistics;
  final String source;

  MarketOverviewResponse({
    required this.analyzedAt,
    required this.overallTrend,
    required this.insights,
    required this.topGainers,
    required this.topLosers,
    required this.statistics,
    required this.source,
  });

  factory MarketOverviewResponse.fromJson(Map<String, dynamic> json) {
    return MarketOverviewResponse(
      analyzedAt: DateTime.parse(json['analyzedAt']),
      overallTrend: json['overallTrend'],
      insights: (json['insights'] as List)
          .map((i) => Insight.fromJson(i))
          .toList(),
      topGainers: (json['topGainers'] as List)
          .map((i) => TopMover.fromJson(i))
          .toList(),
      topLosers: (json['topLosers'] as List)
          .map((i) => TopMover.fromJson(i))
          .toList(),
      statistics: MarketStatistics.fromJson(json['statistics']),
      source: json['source'],
    );
  }
}

class Insight {
  final String title;
  final String description;
  final String type;

  Insight({required this.title, required this.description, required this.type});

  factory Insight.fromJson(Map<String, dynamic> json) {
    return Insight(
      title: json['title'],
      description: json['description'],
      type: json['type'],
    );
  }
}

class TopMover {
  final String symbol;
  final String name;
  final double price;
  final double percentChange24h;
  final double marketCap;

  TopMover({
    required this.symbol,
    required this.name,
    required this.price,
    required this.percentChange24h,
    required this.marketCap,
  });

  factory TopMover.fromJson(Map<String, dynamic> json) {
    return TopMover(
      symbol: json['symbol'],
      name: json['name'],
      price: (json['price'] as num).toDouble(),
      percentChange24h: (json['percentChange24h'] as num).toDouble(),
      marketCap: (json['marketCap'] as num).toDouble(),
    );
  }
}

class MarketStatistics {
  final double totalMarketCap;
  final double totalVolume24h;
  final int totalCoins;
  final double btcDominance;
  final double ethDominance;
  final int coinsUp;
  final int coinsDown;
  final double marketBreadth;
  final double averageChange24h;
  final double medianChange24h;
  final double volumeToMarketCapRatio;
  final double volatilityIndex;

  MarketStatistics({
    required this.totalMarketCap,
    required this.totalVolume24h,
    required this.totalCoins,
    required this.btcDominance,
    required this.ethDominance,
    required this.coinsUp,
    required this.coinsDown,
    required this.marketBreadth,
    required this.averageChange24h,
    required this.medianChange24h,
    required this.volumeToMarketCapRatio,
    required this.volatilityIndex,
  });

  factory MarketStatistics.fromJson(Map<String, dynamic> json) {
    return MarketStatistics(
      totalMarketCap: (json['totalMarketCap'] as num).toDouble(),
      totalVolume24h: (json['totalVolume24h'] as num).toDouble(),
      totalCoins: json['totalCoins'],
      btcDominance: (json['btcDominance'] as num).toDouble(),
      ethDominance: (json['ethDominance'] as num).toDouble(),
      coinsUp: json['coinsUp'],
      coinsDown: json['coinsDown'],
      marketBreadth: (json['marketBreadth'] as num).toDouble(),
      averageChange24h: (json['averageChange24h'] as num).toDouble(),
      medianChange24h: (json['medianChange24h'] as num).toDouble(),
      volumeToMarketCapRatio: (json['volumeToMarketCapRatio'] as num)
          .toDouble(),
      volatilityIndex: (json['volatilityIndex'] as num).toDouble(),
    );
  }
}
