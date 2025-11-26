/// Application configuration EXAMPLE
/// Copy this file to app_config.dart and fill in your actual values
class AppConfig {
  // Backend API Configuration
  static const String backendApiUrl = 'https://localhost:7175';
  static const String apiBaseUrl = '$backendApiUrl/api';

  // Supabase Configuration
  static const String supabaseUrl = 'YOUR_SUPABASE_URL';
  static const String supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

  // SignalR Hub Endpoints
  static const String priceHubUrl = '$backendApiUrl/pricehub';
  static const String globalMetricHubUrl = '$backendApiUrl/globalmetrichub';
  static const String alertHubUrl = '$backendApiUrl/alerthub'; // Global alerts
  static const String userAlertHubUrl =
      '$backendApiUrl/useralerthub'; // User price alerts

  // App Configuration
  static const String appName = 'Market Analysis';
  static const int apiTimeout = 30000; // 30 seconds
  static const int maxRetries = 3;

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // Cache Duration
  static const Duration cacheDuration = Duration(minutes: 5);

  // Google OAuth
  static const String googleClientId = 'YOUR_GOOGLE_CLIENT_ID';
}
