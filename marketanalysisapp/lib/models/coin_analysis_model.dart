class CoinAnalysisResponse {
  final String symbol;
  final DateTime analyzedAt;
  final double currentPrice;
  final double percentChange7d;
  final List<Insight> insights;
  final String source;

  CoinAnalysisResponse({
    required this.symbol,
    required this.analyzedAt,
    required this.currentPrice,
    required this.percentChange7d,
    required this.insights,
    required this.source,
  });

  factory CoinAnalysisResponse.fromJson(Map<String, dynamic> json) {
    return CoinAnalysisResponse(
      symbol: json['symbol'],
      analyzedAt: DateTime.parse(json['analyzedAt']),
      currentPrice: (json['currentPrice'] as num).toDouble(),
      percentChange7d: (json['percentChange7d'] as num).toDouble(),
      insights: (json['insights'] as List)
          .map((i) => Insight.fromJson(i))
          .toList(),
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
