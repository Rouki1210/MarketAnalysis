class UserAlert {
  final int id;
  final int userId;
  final int assetId;
  final String assetSymbol;
  final String assetName;
  final String alertType;
  final double targetPrice;
  final bool isRepeating;
  final String? note;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? lastTriggeredAt;
  final int triggerCount;

  UserAlert({
    required this.id,
    required this.userId,
    required this.assetId,
    required this.assetSymbol,
    required this.assetName,
    required this.alertType,
    required this.targetPrice,
    required this.isRepeating,
    this.note,
    required this.isActive,
    required this.createdAt,
    this.lastTriggeredAt,
    required this.triggerCount,
  });

  factory UserAlert.fromJson(Map<String, dynamic> json) {
    return UserAlert(
      id: json['id'] as int,
      userId: json['userId'] as int,
      assetId: json['assetId'] as int,
      assetSymbol: json['assetSymbol'] as String,
      assetName: json['assetName'] as String,
      alertType: json['alertType'] as String,
      targetPrice: (json['targetPrice'] as num).toDouble(),
      isRepeating: json['isRepeating'] as bool,
      note: json['note'] as String?,
      isActive: json['isActive'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      lastTriggeredAt: json['lastTriggeredAt'] != null
          ? DateTime.parse(json['lastTriggeredAt'] as String)
          : null,
      triggerCount: json['triggerCount'] as int,
    );
  }
}

class CreateUserAlert {
  final int assetId;
  final String alertType;
  final double targetPrice;
  final bool isRepeating;
  final String? note;

  CreateUserAlert({
    required this.assetId,
    required this.alertType,
    required this.targetPrice,
    this.isRepeating = false,
    this.note,
  });

  Map<String, dynamic> toJson() {
    return {
      'assetId': assetId,
      'alertType': alertType,
      'targetPrice': targetPrice,
      'isRepeating': isRepeating,
      'note': note,
    };
  }
}

class UpdateUserAlert {
  final double? targetPrice;
  final bool? isRepeating;
  final bool? isActive;
  final String? note;

  UpdateUserAlert({
    this.targetPrice,
    this.isRepeating,
    this.isActive,
    this.note,
  });

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    if (targetPrice != null) data['targetPrice'] = targetPrice;
    if (isRepeating != null) data['isRepeating'] = isRepeating;
    if (isActive != null) data['isActive'] = isActive;
    if (note != null) data['note'] = note;
    return data;
  }
}
