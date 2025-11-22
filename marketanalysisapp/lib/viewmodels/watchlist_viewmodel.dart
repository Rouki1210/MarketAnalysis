import 'package:flutter/foundation.dart';
import '../models/watchlist_model.dart';
import '../repositories/watchlist_repository.dart';

/// Watchlist state enum
enum WatchlistState { initial, loading, loaded, error }

/// Watchlist ViewModel
class WatchlistViewModel extends ChangeNotifier {
  final WatchlistRepository _repository;

  WatchlistViewModel({WatchlistRepository? repository})
    : _repository = repository ?? WatchlistRepository();

  // State
  WatchlistState _state = WatchlistState.initial;
  Watchlist? _mainWatchlist;
  String? _errorMessage;

  // Getters
  WatchlistState get state => _state;
  Watchlist? get mainWatchlist => _mainWatchlist;
  String? get errorMessage => _errorMessage;
  bool get isLoading => _state == WatchlistState.loading;

  /// Load main watchlist (create if not exists)
  Future<void> loadMainWatchlist() async {
    try {
      _state = WatchlistState.loading;
      _errorMessage = null;
      notifyListeners();

      final watchlists = await _repository.getWatchlists();

      if (watchlists.isNotEmpty) {
        // Use the first watchlist as main
        _mainWatchlist = watchlists.first;

        // Ensure items are loaded if they weren't included in the list response
        if (_mainWatchlist!.items == null) {
          final items = await _repository.getWatchlistItems(_mainWatchlist!.id);
          // Create a new copy with items
          _mainWatchlist = Watchlist(
            id: _mainWatchlist!.id,
            userId: _mainWatchlist!.userId,
            name: _mainWatchlist!.name,
            createdAt: _mainWatchlist!.createdAt,
            updatedAt: _mainWatchlist!.updatedAt,
            items: items,
          );
        }
      } else {
        // Create default 'Main' watchlist
        _mainWatchlist = await _repository.createWatchlist('Main');
      }

      _state = WatchlistState.loaded;
      notifyListeners();
    } catch (e) {
      _state = WatchlistState.error;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  /// Add asset to main watchlist
  Future<bool> addToMainWatchlist(String assetSymbol) async {
    if (_mainWatchlist == null) return false;

    try {
      await _repository.addToWatchlist(_mainWatchlist!.id, assetSymbol);
      // Reload to get updated items
      await loadMainWatchlist();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Remove asset from main watchlist
  Future<bool> removeFromMainWatchlist(String assetSymbol) async {
    if (_mainWatchlist == null) return false;

    try {
      await _repository.removeFromWatchlist(_mainWatchlist!.id, assetSymbol);
      // Reload to get updated items
      await loadMainWatchlist();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Check if asset is in main watchlist
  bool isInMainWatchlist(String assetSymbol) {
    if (_mainWatchlist == null || _mainWatchlist!.items == null) return false;

    return _mainWatchlist!.items!.any(
      (item) => item.assetSymbol.toUpperCase() == assetSymbol.toUpperCase(),
    );
  }

  /// Clear error
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
