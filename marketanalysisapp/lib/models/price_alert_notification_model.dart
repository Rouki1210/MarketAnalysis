class PriceAlertNotification {
  final int id;
  final int userAlertId;
  final String assetSymbol;
  final String assetName;
  final String alertType;
  final double targetPrice;
  final double actualPrice;
  final DateTime triggeredAt;
  final bool wasNotified;
  final DateTime? viewedAt;

  PriceAlertNotification({
    required this.id,
    required this.userAlertId,
    required this.assetSymbol,
    required this.assetName,
    required this.alertType,
    required this.targetPrice,
    required this.actualPrice,
    required this.triggeredAt,
    required this.wasNotified,
    this.viewedAt,
  });

  factory PriceAlertNotification.fromJson(Map<String, dynamic> json) {
    return PriceAlertNotification(
      id: json['id'] as int,
      userAlertId: json['userAlertId'] as int,
      assetSymbol: json['assetSymbol'] as String,
      assetName: json['assetName'] as String,
      alertType: json['alertType'] as String,
      targetPrice: (json['targetPrice'] as num).toDouble(),
      actualPrice: (json['actualPrice'] as num).toDouble(),
      triggeredAt: DateTime.parse(json['triggeredAt'] as String),
      wasNotified: json['wasNotified'] as bool,
      viewedAt: json['viewedAt'] != null
          ? DateTime.parse(json['viewedAt'] as String)
          : null,
    );
  }

  double get priceDifference {
    if (targetPrice == 0) return 0;
    return ((actualPrice - targetPrice) / targetPrice) * 100;
  }

  bool get isViewed => viewedAt != null;
}
