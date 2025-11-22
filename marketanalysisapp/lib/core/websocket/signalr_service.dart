import 'package:signalr_netcore/signalr_client.dart';
import 'package:logging/logging.dart';

/// Base SignalR service for managing hub connections
class SignalRService {
  HubConnection? _hubConnection;
  final String hubUrl;
  final String hubName;

  bool get isConnected => _hubConnection?.state == HubConnectionState.Connected;

  SignalRService({required this.hubUrl, required this.hubName});

  /// Initialize and start the hub connection
  Future<void> connect() async {
    try {
      if (_hubConnection != null && isConnected) {
        return;
      }

      _hubConnection = HubConnectionBuilder()
          .withUrl(
            hubUrl,
            options: HttpConnectionOptions(
              transport: HttpTransportType.WebSockets,
              skipNegotiation: false,
              logMessageContent: true,
            ),
          )
          .withAutomaticReconnect()
          .configureLogging(Logger("SignalR - $hubName")..level = Level.ALL)
          .build();

      // Connection closed handler
      _hubConnection!.onclose(({error}) {
        // Handle close
      });

      // Reconnecting handler
      _hubConnection!.onreconnecting(({error}) {
        // Handle reconnecting
      });

      // Reconnected handler
      _hubConnection!.onreconnected(({connectionId}) {
        // Handle reconnected
      });

      await _hubConnection!.start();
    } catch (e) {
      rethrow;
    }
  }

  /// Register a callback for a specific hub method
  void on(String methodName, Function(List<Object?>?) callback) {
    if (_hubConnection == null) {
      return;
    }
    _hubConnection!.on(methodName, callback);
  }

  /// Invoke a server method
  Future<Object?> invoke(String methodName, {List<Object>? args}) async {
    if (_hubConnection == null || !isConnected) {
      throw Exception('$hubName is not connected');
    }
    return await _hubConnection!.invoke(methodName, args: args);
  }

  /// Disconnect from the hub
  Future<void> disconnect() async {
    if (_hubConnection != null) {
      await _hubConnection!.stop();
    }
  }

  /// Dispose and clean up
  void dispose() {
    disconnect();
    _hubConnection = null;
  }
}
