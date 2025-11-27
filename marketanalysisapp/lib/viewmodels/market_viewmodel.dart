import 'package:flutter/foundation.dart';
import '../models/asset_model.dart';
import '../models/market_model.dart';
import '../repositories/asset_repository.dart';
import '../services/realtime/price_hub_service.dart';
import '../services/realtime/global_metric_hub_service.dart';

/// Market data state enum
enum MarketDataState { initial, loading, loaded, error }

/// Market ViewModel for cryptocurrency data and real-time updates
class MarketViewModel extends ChangeNotifier {
  final AssetRepository _assetRepository;
  final PriceHubService _priceHubService;
  final GlobalMetricHubService _globalMetricHubService;

  MarketViewModel({
    AssetRepository? assetRepository,
    PriceHubService? priceHubService,
    GlobalMetricHubService? globalMetricHubService,
  }) : _assetRepository = assetRepository ?? AssetRepository(),
       _priceHubService = priceHubService ?? PriceHubService(),
       _globalMetricHubService =
           globalMetricHubService ?? GlobalMetricHubService() {
    _initializeRealtime();
  }

  // State
  MarketDataState _state = MarketDataState.initial;
  List<Coin> _coins = [];
  List<Coin> _filteredCoins = [];
  MarketOverview? _marketOverview;
  String? _errorMessage;
  String _searchQuery = '';
  String _selectedTab =
      'Top'; // Top, Trending, Most Visited, New, Gainers, Real-World Assets
  bool _isRealtimeConnected = false;

  // Sorting
  String _sortField = 'rank'; // rank, marketCap, volume
  bool _sortAscending = true;

  // Getters
  MarketDataState get state => _state;
  List<Coin> get coins => _filteredCoins.isNotEmpty ? _filteredCoins : _coins;
  MarketOverview? get marketOverview => _marketOverview;
  String? get errorMessage => _errorMessage;
  bool get isLoading => _state == MarketDataState.loading;
  bool get isRealtimeConnected => _isRealtimeConnected;
  String get searchQuery => _searchQuery;
  String get selectedTab => _selectedTab;
  String get sortField => _sortField;
  bool get sortAscending => _sortAscending;

  /// Initialize SignalR real-time connections
  Future<void> _initializeRealtime() async {
    try {
      // Connect to PriceHub
      await _priceHubService.connect();

      // Subscribe to price updates
      // Note: We'll subscribe to specific assets after loading coins

      // Connect to GlobalMetricHub
      await _globalMetricHubService.connect();
      _globalMetricHubService.subscribeToMetrics((metrics) {
        _updateMarketOverview(metrics);
      });

      _isRealtimeConnected = true;
      notifyListeners();
    } catch (e) {
      _isRealtimeConnected = false;
      notifyListeners();
    }
  }

  /// Subscribe to real-time updates for loaded coins
  Future<void> _subscribeToCoins() async {
    if (_coins.isEmpty) return;

    final symbols = _coins.map((coin) => coin.symbol).toList();
    await _priceHubService.subscribeToAssets(symbols, (priceData) {
      _handlePriceUpdate(priceData);
    });
  }

  /// Handle individual price update from SignalR
  void _handlePriceUpdate(Map<String, dynamic> message) {
    try {
      // Extract data from message structure: { type: "price_update", data: {...} }
      final data = message['data'] as Map<String, dynamic>?;
      if (data == null) return;

      final symbol = (data['asset'] as String?)?.toUpperCase();
      if (symbol == null) return;

      final index = _coins.indexWhere((coin) => coin.symbol == symbol);
      if (index != -1) {
        _coins[index] = Coin(
          id: _coins[index].id,
          symbol: symbol,
          name: _coins[index].name,
          icon: _coins[index].icon,
          rank: _coins[index].rank,
          price: (data['price'] as num?)?.toDouble() ?? _coins[index].price,
          change1h:
              (data['change1h'] as num?)?.toDouble() ?? _coins[index].change1h,
          change24h:
              (data['change24h'] as num?)?.toDouble() ??
              _coins[index].change24h,
          change7d:
              (data['change7d'] as num?)?.toDouble() ?? _coins[index].change7d,
          marketCap:
              (data['marketCap'] as num?)?.toDouble() ??
              _coins[index].marketCap,
          volume24h:
              (data['volume'] as num?)?.toDouble() ?? _coins[index].volume24h,
          supply: _coins[index].supply,
          sparklineData: _coins[index].sparklineData,
        );

        _applyFilters();
        notifyListeners();
      }
    } catch (e) {
      // Silently handle errors
    }
  }

  @override
  void dispose() {
    _priceHubService.dispose();
    _globalMetricHubService.dispose();
    super.dispose();
  }

  void _updateMarketOverview(Map<String, dynamic> metrics) {
    _marketOverview = MarketOverview(
      totalMarketCap:
          (metrics['total_market_cap_usd'] as num?)?.toDouble() ??
          _marketOverview?.totalMarketCap ??
          0,
      totalMarketCapChange24h:
          (metrics['total_market_cap_percent_change_24h'] as num?)
              ?.toDouble() ??
          _marketOverview?.totalMarketCapChange24h ??
          0,
      totalVolume24h:
          (metrics['total_volume_24h'] as num?)?.toDouble() ??
          _marketOverview?.totalVolume24h ??
          0,
      totalVolume24hChange24h:
          (metrics['total_volume_24h_percent_change_24h'] as num?)
              ?.toDouble() ??
          _marketOverview?.totalVolume24hChange24h ??
          0,
      btcDominance:
          (metrics['bitcoin_dominance_price'] as num?)?.toDouble() ??
          _marketOverview?.btcDominance ??
          0,
      ethDominance:
          (metrics['ethereum_dominance_price'] as num?)?.toDouble() ??
          _marketOverview?.ethDominance ??
          0,
      btcDominanceChange:
          (metrics['bitcoin_dominance_percentage'] as num?)?.toDouble() ??
          _marketOverview?.btcDominanceChange ??
          0,
      ethDominanceChange:
          (metrics['ethereum_dominance_percentage'] as num?)?.toDouble() ??
          _marketOverview?.ethDominanceChange ??
          0,
      fearGreedIndex:
          int.tryParse(metrics['fear_and_greed_index']?.toString() ?? '') ??
          _marketOverview?.fearGreedIndex ??
          50,
      fearGreedText:
          (metrics['fear_and_greed_text'] as String?) ??
          _marketOverview?.fearGreedText ??
          'Neutral',
    );

    notifyListeners();
  }

  /// Load all coins
  Future<void> loadCoins() async {
    try {
      _state = MarketDataState.loading;
      _errorMessage = null;
      notifyListeners();

      _coins = await _assetRepository.getCoins();
      _applyFilters();

      _state = MarketDataState.loaded;
      notifyListeners();

      // Subscribe to real-time updates for loaded coins
      if (_isRealtimeConnected) {
        await _subscribeToCoins();
      }
    } catch (e) {
      _state = MarketDataState.error;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  /// Get coin by symbol
  Future<Coin?> getCoinBySymbol(String symbol) async {
    try {
      return await _assetRepository.getCoinBySymbol(symbol);
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }

  /// Update multiple coins with real-time price data (Batch update)
  void updateCoinsBatch(List<dynamic> priceUpdates) {
    if (priceUpdates.isEmpty) return;

    bool anyUpdated = false;
    for (final dynamic rawData in priceUpdates) {
      if (rawData is! Map) continue;
      final priceData = rawData as Map<String, dynamic>;

      // Handle multiple key variations (camelCase, PascalCase, etc.)
      final symbol =
          (priceData['symbol'] ??
                  priceData['Symbol'] ??
                  priceData['assetSymbol'] ??
                  priceData['AssetSymbol'])
              ?.toString()
              .toUpperCase();

      if (symbol == null) continue;

      final index = _coins.indexWhere((coin) => coin.symbol == symbol);
      if (index != -1) {
        // Helper to get double value from multiple keys
        double? getDouble(List<String> keys) {
          for (final key in keys) {
            if (priceData[key] != null) {
              return (priceData[key] as num).toDouble();
            }
          }
          return null;
        }

        // Update coin with new price data
        _coins[index] = Coin(
          id: _coins[index].id,
          symbol: symbol,
          name: _coins[index].name,
          icon: _coins[index].icon,
          rank: _coins[index].rank,
          price: getDouble(['price', 'Price']) ?? _coins[index].price,
          change1h:
              getDouble(['change1h', 'Change1h', 'percentChange1h']) ??
              _coins[index].change1h,
          change24h:
              getDouble(['change24h', 'Change24h', 'percentChange24h']) ??
              _coins[index].change24h,
          change7d:
              getDouble(['change7d', 'Change7d', 'percentChange7d']) ??
              _coins[index].change7d,
          marketCap:
              getDouble(['marketCap', 'MarketCap']) ?? _coins[index].marketCap,
          volume24h:
              getDouble(['volume', 'Volume', 'volume24h', 'Volume24h']) ??
              _coins[index].volume24h,
          supply: _coins[index].supply,
          sparklineData: _coins[index].sparklineData,
        );
        anyUpdated = true;
      }
    }

    if (anyUpdated) {
      _applyFilters();
      notifyListeners();
    }
  }

  /// Set search query
  void setSearchQuery(String query) {
    _searchQuery = query;
    _applyFilters();
    notifyListeners();
  }

  /// Set selected tab
  void setSelectedTab(String tab) {
    _selectedTab = tab;
    // Reset sort to default when changing tabs to ensure tab's specific view is shown
    _sortField = 'rank';
    _sortAscending = true;
    _applyFilters();
    notifyListeners();
  }

  /// Sort by field
  void sortBy(String field) {
    if (_sortField == field) {
      _sortAscending = !_sortAscending;
    } else {
      _sortField = field;
      _sortAscending = false; // Default to desc for metrics
    }
    _applyFilters();
    notifyListeners();
  }

  /// Apply filters based on search and tab selection
  void _applyFilters() {
    List<Coin> filtered = List.from(_coins);

    // Apply search filter
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((coin) {
        return coin.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            coin.symbol.toLowerCase().contains(_searchQuery.toLowerCase());
      }).toList();
    }

    // Apply tab filter/sort
    // We always apply this first to get the base set/order for the tab
    switch (_selectedTab) {
      case 'Trending':
        // Sort by 24h Volume (highest to lowest)
        filtered.sort((a, b) => b.volume24h.compareTo(a.volume24h));
        break;
      case 'Most Visited':
        // Sort by viewCount (highest to lowest)
        filtered.sort((a, b) => b.viewCount.compareTo(a.viewCount));
        break;
      case 'New':
        // Sort by creation date (newest first)
        filtered.sort((a, b) {
          final dateA = a.createdAt ?? DateTime(2000);
          final dateB = b.createdAt ?? DateTime(2000);
          return dateB.compareTo(dateA);
        });
        break;
      case 'Gainers':
        // Shows only coins with positive 24h change, sorted by highest gain
        filtered = filtered.where((coin) => coin.change24h > 0).toList();
        filtered.sort((a, b) => b.change24h.compareTo(a.change24h));
        break;
      case 'Top':
      default:
        // Sort by rank (top coins)
        filtered.sort((a, b) => (a.rank ?? 999).compareTo(b.rank ?? 999));
        break;
    }

    // Apply explicit sorting
    if (_sortField != 'rank') {
      filtered.sort((a, b) {
        double valA = 0;
        double valB = 0;

        switch (_sortField) {
          case 'marketCap':
            valA = a.marketCap;
            valB = b.marketCap;
            break;
          case 'volume':
            valA = a.volume24h;
            valB = b.volume24h;
            break;
        }

        return _sortAscending ? valA.compareTo(valB) : valB.compareTo(valA);
      });
    } else if (_selectedTab == 'Top') {
      // Explicit rank sort for Top tab if needed, or default
      // If sortField is rank, we might want to respect sortAscending too
      // But usually rank is always asc. Let's leave tab logic above for now.
    }

    _filteredCoins = filtered;
  }

  /// Refresh coins
  Future<void> refresh() async {
    await loadCoins();
  }

  /// Clear error
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
