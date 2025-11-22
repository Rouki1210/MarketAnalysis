import '../../core/websocket/signalr_service.dart';
import '../../config/app_config.dart';

/// Global Metric Hub Service for market overview data
class GlobalMetricHubService extends SignalRService {
  GlobalMetricHubService()
    : super(hubUrl: AppConfig.globalMetricHubUrl, hubName: 'GlobalMetricHub');

  /// Subscribe to global market metrics updates
  void subscribeToMetrics(Function(Map<String, dynamic>) onMetricsUpdate) {
    on('ReceiveGlobalMetric', (args) {
      if (args != null && args.isNotEmpty) {
        final message = args[0] as Map<String, dynamic>;
        // Extract data from message structure: { type: "GlobalMetric", data: {...} }
        final data = message['data'] as Map<String, dynamic>?;
        if (data != null) {
          onMetricsUpdate(data);
        }
      }
    });
  }

  /// Request current global metrics
  Future<void> requestMetrics() async {
    await invoke('RequestGlobalMetrics');
  }
}
