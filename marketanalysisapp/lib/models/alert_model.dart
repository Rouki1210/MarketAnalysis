/// Alert condition enum
enum AlertCondition { above, below, percentChange }

/// Alert status enum
enum AlertStatus { active, triggered, cancelled }

/// Global alert model
class GlobalAlert {
  final int id;
  final String assetSymbol;
  final String title;
  final String message;
  final DateTime createdAt;
  final DateTime? triggeredAt;

  GlobalAlert({
    required this.id,
    required this.assetSymbol,
    required this.title,
    required this.message,
    required this.createdAt,
    this.triggeredAt,
  });

  factory GlobalAlert.fromJson(Map<String, dynamic> json) {
    return GlobalAlert(
      id: json['id'] as int,
      assetSymbol: (json['assetSymbol'] as String).toUpperCase(),
      title: json['title'] as String,
      message: json['message'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      triggeredAt: json['triggeredAt'] != null
          ? DateTime.parse(json['triggeredAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'assetSymbol': assetSymbol,
      'title': title,
      'message': message,
      'createdAt': createdAt.toIso8601String(),
      'triggeredAt': triggeredAt?.toIso8601String(),
    };
  }
}

/// User alert model
class UserAlert {
  final int id;
  final int userId;
  final String assetSymbol;
  final String condition; // 'above', 'below', 'percent_change'
  final double targetPrice;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? triggeredAt;

  UserAlert({
    required this.id,
    required this.userId,
    required this.assetSymbol,
    required this.condition,
    required this.targetPrice,
    required this.isActive,
    required this.createdAt,
    this.triggeredAt,
  });

  factory UserAlert.fromJson(Map<String, dynamic> json) {
    return UserAlert(
      id: json['id'] as int,
      userId: json['userId'] as int,
      assetSymbol: (json['assetSymbol'] as String).toUpperCase(),
      condition: json['condition'] as String,
      targetPrice: (json['targetPrice'] as num).toDouble(),
      isActive: json['isActive'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      triggeredAt: json['triggeredAt'] != null
          ? DateTime.parse(json['triggeredAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'assetSymbol': assetSymbol,
      'condition': condition,
      'targetPrice': targetPrice,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'triggeredAt': triggeredAt?.toIso8601String(),
    };
  }
}
