import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/asset_model.dart';

/// Repository for asset/cryptocurrency data
class AssetRepository {
  final ApiClient _apiClient;

  AssetRepository({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient();

  /// Get all assets
  Future<List<Asset>> getAssets() async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.assets,
        includeAuth: false,
      );

      final List<dynamic> assetsJson = response as List<dynamic>;
      return assetsJson.map((json) {
        return Asset.fromJson(json as Map<String, dynamic>);
      }).toList();
    } catch (e) {
      throw Exception('Failed to load assets: $e');
    }
  }

  /// Get asset by symbol
  Future<Asset> getAssetBySymbol(String symbol) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.assetBySymbol(symbol),
        includeAuth: false,
      );

      return Asset.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to load asset $symbol: $e');
    }
  }

  /// Get prices for all assets
  Future<List<PricePoint>> getPrices() async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.prices,
        includeAuth: false,
      );

      final List<dynamic> pricesJson = response as List<dynamic>;
      return pricesJson.map((json) {
        return PricePoint.fromJson(json as Map<String, dynamic>);
      }).toList();
    } catch (e) {
      throw Exception('Failed to load prices: $e');
    }
  }

  /// Get price by symbol
  Future<PricePoint> getPriceBySymbol(String symbol) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.pricesBySymbol(symbol),
        includeAuth: false,
      );

      return PricePoint.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to load price for $symbol: $e');
    }
  }

  /// Get coin data (asset + price combined)
  Future<List<Coin>> getCoins() async {
    try {
      // Fetch both assets and prices
      final assets = await getAssets();
      final prices = await getPrices();

      // Create a map of prices by symbol for quick lookup
      final priceMap = <String, PricePoint>{};
      for (var price in prices) {
        priceMap[price.assetSymbol] = price;
      }

      // Combine assets with their prices
      return assets
          .map((asset) => Coin.fromAssetAndPrice(asset, priceMap[asset.symbol]))
          .toList();
    } catch (e) {
      throw Exception('Failed to load coins: $e');
    }
  }

  /// Get coin by symbol (asset + price combined)
  Future<Coin> getCoinBySymbol(String symbol) async {
    try {
      final asset = await getAssetBySymbol(symbol);
      final price = await getPriceBySymbol(symbol);

      return Coin.fromAssetAndPrice(asset, price);
    } catch (e) {
      throw Exception('Failed to load coin $symbol: $e');
    }
  }

  /// Search coins by query
  Future<List<Coin>> searchCoins(String query) async {
    try {
      // 1. Search assets from API
      final response = await _apiClient.get(
        ApiEndpoints.searchAssets(query),
        includeAuth: false,
      );

      final List<dynamic> assetsJson = response as List<dynamic>;
      final assets = assetsJson.map((json) {
        return Asset.fromJson(json as Map<String, dynamic>);
      }).toList();

      if (assets.isEmpty) return [];

      // 2. Get all prices (assuming we want to show prices for search results)
      // Optimization: In a real app, we might want to fetch prices only for the results,
      // but since our price endpoint returns all prices, we'll use that or cache.
      // For now, let's fetch all prices to ensure accuracy.
      final prices = await getPrices();
      final priceMap = <String, PricePoint>{};
      for (var price in prices) {
        priceMap[price.assetSymbol] = price;
      }

      // 3. Combine
      return assets
          .map((asset) => Coin.fromAssetAndPrice(asset, priceMap[asset.symbol]))
          .toList();
    } catch (e) {
      throw Exception('Failed to search coins: $e');
    }
  }
}
