import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/market_overview_model.dart';
import '../models/coin_analysis_model.dart';

/// Repository for AI market analysis data
class MarketAiRepository {
  final ApiClient _apiClient;

  MarketAiRepository({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient();

  /// Get market overview AI analysis
  Future<MarketOverviewResponse> getMarketOverview() async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.marketOverview,
        includeAuth: false,
      );

      return MarketOverviewResponse.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to load market overview: $e');
    }
  }

  /// Get coin-specific AI analysis
  Future<CoinAnalysisResponse> getCoinAnalysis(String symbol) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.coinAnalysis(symbol),
        includeAuth: false,
      );

      return CoinAnalysisResponse.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to load analysis for $symbol: $e');
    }
  }
}
