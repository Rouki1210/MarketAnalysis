import '../../core/websocket/signalr_service.dart';
import '../../config/app_config.dart';

/// Alert Hub Service for price alert notifications
class AlertHubService extends SignalRService {
  AlertHubService()
    : super(hubUrl: AppConfig.userAlertHubUrl, hubName: 'UserAlertHub');

  /// Subscribe to alert notifications
  void subscribeToAlerts(Function(Map<String, dynamic>) onAlertTriggered) {
    on('ReceiveAlert', (args) {
      if (args != null && args.isNotEmpty) {
        final data = args[0] as Map<String, dynamic>;
        print('Alert triggered: ${data['message']}');
        onAlertTriggered(data);
      }
    });
  }

  /// Subscribe to global alerts
  void subscribeToGlobalAlerts(Function(Map<String, dynamic>) onGlobalAlert) {
    on('ReceiveGlobalAlert', (args) {
      if (args != null && args.isNotEmpty) {
        final data = args[0] as Map<String, dynamic>;
        print('Global alert: ${data['message']}');
        onGlobalAlert(data);
      }
    });
  }

  /// Join user's alert group (for authenticated users)
  Future<void> joinUserAlertGroup(String userId) async {
    await invoke('JoinUserAlertGroup', args: [userId]);
    print('Joined alert group for user: $userId');
  }

  /// Leave user's alert group
  Future<void> leaveUserAlertGroup(String userId) async {
    await invoke('LeaveUserAlertGroup', args: [userId]);
    print('Left alert group for user: $userId');
  }
}
