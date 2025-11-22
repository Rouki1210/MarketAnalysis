import 'user_model.dart';

class AppNotification {
  final int id;
  final UserBasic? actorUser;
  final String notificationType;
  final String entityType;
  final int entityId;
  final String message;
  final bool isRead;
  final DateTime createdAt;

  AppNotification({
    required this.id,
    this.actorUser,
    required this.notificationType,
    required this.entityType,
    required this.entityId,
    required this.message,
    required this.isRead,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as int,
      actorUser: json['actorUser'] != null
          ? UserBasic.fromJson(json['actorUser'] as Map<String, dynamic>)
          : null,
      notificationType: json['notificationType'] as String,
      entityType: json['entityType'] as String,
      entityId: json['entityId'] as int,
      message: json['message'] as String,
      isRead: json['isRead'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
