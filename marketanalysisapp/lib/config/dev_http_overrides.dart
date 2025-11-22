import 'dart:io';

/// HTTP Overrides for development environment
/// Bypasses SSL certificate verification for localhost
class DevHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback = (X509Certificate cert, String host, int port) {
        // Allow self-signed certificates for localhost and local network IPs
        return host == 'localhost' ||
            host == '127.0.0.1' ||
            host.startsWith('192.168.') ||
            host.startsWith('10.0.2.'); // Android Emulator
      };
  }
}
