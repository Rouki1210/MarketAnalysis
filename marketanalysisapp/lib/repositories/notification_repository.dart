import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/price_alert_notification_model.dart';

class NotificationRepository {
  final ApiClient _apiClient;

  NotificationRepository({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient();

  Future<List<PriceAlertNotification>> getNotifications({
    int limit = 50,
  }) async {
    try {
      final response = await _apiClient.get(
        '${ApiEndpoints.alerts}/history?limit=$limit',
        includeAuth: true,
      );

      // Debug logging
      print('DEBUG: Alert History Response: $response');
      print('DEBUG: Response type: ${response.runtimeType}');

      // Response is a direct list, not wrapped in ApiResponse
      final List<dynamic> data = response as List<dynamic>;
      print('DEBUG: Got ${data.length} alert notifications');

      return data
          .map(
            (json) =>
                PriceAlertNotification.fromJson(json as Map<String, dynamic>),
          )
          .toList();
    } catch (e) {
      print('DEBUG: Error loading alert notifications: $e');
      throw Exception('Failed to load alert notifications: $e');
    }
  }

  Future<int> getUnreadCount() async {
    try {
      // Get all notifications and count unviewed ones
      final notifications = await getNotifications();
      return notifications.where((n) => !n.isViewed).length;
    } catch (e) {
      // Return 0 on error to avoid disrupting UI
      return 0;
    }
  }

  // Mark alert notification as viewed (update viewedAt timestamp)
  // Note: The backend doesn't have a specific endpoint for this yet
  // For now, we'll just track it locally in the app
  Future<bool> markAsRead(int id) async {
    // TODO: Implement backend endpoint to mark alert history as viewed
    return true;
  }

  Future<bool> markAllAsRead() async {
    // TODO: Implement backend endpoint to mark all alert histories as viewed
    return true;
  }

  Future<bool> deleteNotification(int id) async {
    try {
      print('DEBUG Repository: Deleting alert history $id');
      print(
        'DEBUG Repository: Calling DELETE ${ApiEndpoints.alerts}/history/$id',
      );

      final response = await _apiClient.delete(
        '${ApiEndpoints.alerts}/history/$id',
        includeAuth: true,
      );

      print('DEBUG Repository: Delete response: $response');
      print('DEBUG Repository: Delete successful');
      return true;
    } catch (e, stackTrace) {
      print('DEBUG Repository: Error deleting alert history: $e');
      print('DEBUG Repository: Stack trace: $stackTrace');
      // Don't throw - return false so UI can handle gracefully
      return false;
    }
  }
}
