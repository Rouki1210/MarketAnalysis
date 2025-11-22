import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../core/storage/secure_storage.dart';
import '../models/watchlist_model.dart';

/// Repository for watchlist operations
class WatchlistRepository {
  final ApiClient _apiClient;
  final SecureStorageService _secureStorage;

  WatchlistRepository({
    ApiClient? apiClient,
    SecureStorageService? secureStorage,
  }) : _apiClient = apiClient ?? ApiClient(),
       _secureStorage = secureStorage ?? SecureStorageService();

  /// Helper to get user ID and handle errors
  Future<String?> _getUserId() async {
    final userId = await _secureStorage.getUserId();
    if (userId == null || userId.isEmpty) {
      // Optionally log or throw a more specific error if needed
      return null;
    }
    return userId;
  }

  /// Get user's watchlists
  Future<List<Watchlist>> getWatchlists() async {
    try {
      final userId = await _getUserId();
      if (userId == null) return [];

      final endpoint = ApiEndpoints.watchlistsByUser(userId);

      final response = await _apiClient.get(endpoint, includeAuth: true);

      final List<dynamic> watchlistsJson = response as List<dynamic>;
      return watchlistsJson.map((json) {
        return Watchlist.fromJson(json as Map<String, dynamic>);
      }).toList();
    } catch (e) {
      throw Exception('Failed to load watchlists: $e');
    }
  }

  /// Get watchlist by ID
  Future<Watchlist> getWatchlistById(int watchlistId) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.watchlistById(watchlistId),
        includeAuth: true,
      );

      // Handle wrapped response if necessary (based on controller it returns { success: true, data: ... })
      // But ApiClient returns raw JSON.
      // Controller: return Ok(new { success = true, data = watchlist });
      final data =
          response is Map<String, dynamic> && response.containsKey('data')
          ? response['data']
          : response;

      return Watchlist.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to load watchlist: $e');
    }
  }

  /// Create new watchlist
  Future<Watchlist> createWatchlist(String name) async {
    try {
      final userId = await _secureStorage.getUserId();
      if (userId == null) {
        throw Exception('User not logged in');
      }

      // Controller expects 'name' as query param
      final url =
          '${ApiEndpoints.createWatchlist(userId)}?name=${Uri.encodeComponent(name)}';
      final result = await _apiClient.post(url, includeAuth: true);

      final data = result is Map<String, dynamic> && result.containsKey('data')
          ? result['data']
          : result;

      return Watchlist.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to create watchlist: $e');
    }
  }

  /// Delete watchlist
  Future<void> deleteWatchlist(int watchlistId) async {
    // Not supported by backend yet
    throw UnimplementedError('Delete watchlist not supported by backend');
  }

  /// Get watchlist items
  Future<List<WatchlistItem>> getWatchlistItems(int watchlistId) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.watchlistItems(watchlistId),
        includeAuth: true,
      );

      final List<dynamic> itemsJson = response as List<dynamic>;
      return itemsJson
          .map((json) => WatchlistItem.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to load watchlist items: $e');
    }
  }

  /// Add asset to watchlist
  Future<WatchlistItem> addToWatchlist(
    int watchlistId,
    String assetSymbol,
  ) async {
    try {
      // 1. Get asset ID
      final assetResponse = await _apiClient.get(
        ApiEndpoints.assetBySymbol(assetSymbol),
        includeAuth: false,
      );
      final assetId = assetResponse['id'];

      // 2. Add to watchlist
      // Controller: [HttpPost("{watchlistId}/add/{assetId}")]
      await _apiClient.post(
        '/Watchlist/$watchlistId/add/$assetId',
        includeAuth: true,
      );

      // Response is { success: true }. It doesn't return the item.
      // We need to return a dummy item or fetch it.
      // For now, return a dummy item or fetch the list.
      // Let's return a constructed item.
      return WatchlistItem(
        id: 0, // Unknown
        watchlistId: watchlistId,
        assetSymbol: assetSymbol,
        addedAt: DateTime.now(),
      );
    } catch (e) {
      throw Exception('Failed to add to watchlist: $e');
    }
  }

  /// Remove asset from watchlist
  Future<void> removeFromWatchlist(int watchlistId, String assetSymbol) async {
    try {
      // 1. Get asset ID
      final assetResponse = await _apiClient.get(
        ApiEndpoints.assetBySymbol(assetSymbol),
        includeAuth: false,
      );
      final assetId = assetResponse['id'];

      // 2. Remove from watchlist
      // Controller: [HttpDelete("{watchlistId}/remove/{assetId}")]
      await _apiClient.delete(
        '/Watchlist/$watchlistId/remove/$assetId',
        includeAuth: true,
      );
    } catch (e) {
      throw Exception('Failed to remove from watchlist: $e');
    }
  }
}
