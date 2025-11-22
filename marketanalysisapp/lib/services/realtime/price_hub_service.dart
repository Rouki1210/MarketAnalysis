import '../../core/websocket/signalr_service.dart';
import '../../config/app_config.dart';

/// Price Hub Service for real-time cryptocurrency price updates
class PriceHubService extends SignalRService {
  PriceHubService() : super(hubUrl: AppConfig.priceHubUrl, hubName: 'PriceHub');

  /// Subscribe to price updates for a specific asset
  void subscribeToPriceUpdate(
    String symbol,
    Function(Map<String, dynamic>) onPriceUpdate,
  ) {
    on('ReceiveMessage', (args) {
      if (args != null && args.isNotEmpty) {
        final data = args[0] as Map<String, dynamic>;
        onPriceUpdate(data);
      }
    });

    // Join the asset group to receive updates
    invoke('JoinAssetGroup', args: [symbol]);
  }

  /// Subscribe to multiple assets at once
  Future<void> subscribeToAssets(
    List<String> symbols,
    Function(Map<String, dynamic>) onPriceUpdate,
  ) async {
    // Register listener once
    on('ReceiveMessage', (args) {
      if (args != null && args.isNotEmpty) {
        final data = args[0] as Map<String, dynamic>;
        onPriceUpdate(data);
      }
    });

    // Join all asset groups
    for (final symbol in symbols) {
      try {
        await invoke('JoinAssetGroup', args: [symbol]);
      } catch (error) {
        // Silently ignore join errors
      }
    }
  }
}
