import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/user_alert_model.dart';

class AlertRepository {
  final ApiClient _apiClient;

  AlertRepository({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient();

  Future<List<UserAlert>> getAlerts() async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.alerts,
        includeAuth: true,
      );
      final List<dynamic> data = response as List<dynamic>;
      return data
          .map((json) => UserAlert.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to load alerts: $e');
    }
  }

  Future<UserAlert> createAlert(CreateUserAlert alert) async {
    try {
      print('DEBUG: Creating alert with data: ${alert.toJson()}');
      final response = await _apiClient.post(
        ApiEndpoints.alerts,
        body: alert.toJson(),
        includeAuth: true,
      );
      print('DEBUG: Alert created successfully: $response');
      return UserAlert.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      print('DEBUG: Failed to create alert - Error: $e');
      throw Exception('Failed to create alert: $e');
    }
  }

  Future<UserAlert> updateAlert(int id, UpdateUserAlert alert) async {
    try {
      final response = await _apiClient.put(
        '${ApiEndpoints.alerts}/$id',
        body: alert.toJson(),
        includeAuth: true,
      );
      return UserAlert.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to update alert: $e');
    }
  }

  Future<void> deleteAlert(int id) async {
    try {
      await _apiClient.delete('${ApiEndpoints.alerts}/$id', includeAuth: true);
    } catch (e) {
      throw Exception('Failed to delete alert: $e');
    }
  }
}
