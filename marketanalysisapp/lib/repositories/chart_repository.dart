import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/chart_data_model.dart';

/// Repository for fetching chart data from API
class ChartRepository {
  final ApiClient _apiClient;

  ChartRepository({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient();

  /// Fetch line chart price data
  Future<List<ChartPricePoint>> getPriceData(
    String symbol, {
    DateTime? from,
    DateTime? to,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (from != null) queryParams['from'] = from.toIso8601String();
      if (to != null) queryParams['to'] = to.toIso8601String();

      final response = await _apiClient.get(
        ApiEndpoints.pricesBySymbol(symbol),
        queryParams: queryParams.isNotEmpty ? queryParams : null,
        includeAuth: false,
      );

      if (response is List) {
        return response.map((e) => ChartPricePoint.fromJson(e)).toList();
      }
      return [];
    } catch (e) {
      print('ERROR: ChartRepository.getPriceData failed: $e');
      rethrow;
    }
  }

  /// Fetch OHLC candlestick data
  Future<List<OhlcData>> getOhlcData(
    String symbol,
    String timeframe, {
    DateTime? from,
    DateTime? to,
  }) async {
    try {
      final apiTimeframe = ChartTimeframe.getApiTimeframe(timeframe);
      final queryParams = <String, String>{'timeframe': apiTimeframe};
      if (from != null) queryParams['from'] = from.toIso8601String();
      if (to != null) queryParams['to'] = to.toIso8601String();

      final endpoint = '/Prices/ohlc/$symbol';
      final response = await _apiClient.get(
        endpoint,
        queryParams: queryParams,
        includeAuth: false,
      );

      if (response is List) {
        return response.map((e) => OhlcData.fromJson(e)).toList();
      }
      return [];
    } catch (e) {
      print('ERROR: ChartRepository.getOhlcData failed: $e');
      rethrow;
    }
  }
}
