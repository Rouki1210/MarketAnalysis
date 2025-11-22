import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/notification_model.dart';

class NotificationRepository {
  final ApiClient _apiClient;

  NotificationRepository({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient();

  Future<List<AppNotification>> getNotifications({
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      final response = await _apiClient.get(
        '${ApiEndpoints.notifications}?page=$page&pageSize=$pageSize',
        includeAuth: true,
      );

      // Handle ApiResponse wrapper
      final data = response as Map<String, dynamic>;
      if (data['success'] == true && data['data'] != null) {
        final List<dynamic> list = data['data'] as List<dynamic>;
        return list
            .map(
              (json) => AppNotification.fromJson(json as Map<String, dynamic>),
            )
            .toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to load notifications: $e');
    }
  }

  Future<int> getUnreadCount() async {
    try {
      final response = await _apiClient.get(
        '${ApiEndpoints.notifications}/unread-count',
        includeAuth: true,
      );

      final data = response as Map<String, dynamic>;
      if (data['success'] == true) {
        return data['data'] as int;
      }
      return 0;
    } catch (e) {
      // Return 0 on error to avoid disrupting UI
      return 0;
    }
  }

  Future<bool> markAsRead(int id) async {
    try {
      final response = await _apiClient.put(
        '${ApiEndpoints.notifications}/$id/mark-read',
        includeAuth: true,
      );
      final data = response as Map<String, dynamic>;
      return data['success'] == true;
    } catch (e) {
      throw Exception('Failed to mark notification as read: $e');
    }
  }

  Future<bool> markAllAsRead() async {
    try {
      final response = await _apiClient.put(
        '${ApiEndpoints.notifications}/mark-all-read',
        includeAuth: true,
      );
      final data = response as Map<String, dynamic>;
      return data['success'] == true;
    } catch (e) {
      throw Exception('Failed to mark all notifications as read: $e');
    }
  }

  Future<bool> deleteNotification(int id) async {
    try {
      final response = await _apiClient.delete(
        '${ApiEndpoints.notifications}/$id',
        includeAuth: true,
      );
      final data = response as Map<String, dynamic>;
      return data['success'] == true;
    } catch (e) {
      throw Exception('Failed to delete notification: $e');
    }
  }
}
