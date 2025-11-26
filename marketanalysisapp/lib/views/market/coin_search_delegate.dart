import 'package:flutter/material.dart';
import '../../models/asset_model.dart';
import '../../repositories/asset_repository.dart';
import '../../widgets/coin_list_item.dart';
import '../../core/theme/app_colors.dart';
import '../../views/market/coin_detail_screen.dart';

class CoinSearchDelegate extends SearchDelegate<String> {
  final AssetRepository _assetRepository;

  CoinSearchDelegate({AssetRepository? assetRepository})
    : _assetRepository = assetRepository ?? AssetRepository();

  @override
  ThemeData appBarTheme(BuildContext context) {
    final theme = Theme.of(context);
    return theme.copyWith(
      appBarTheme: theme.appBarTheme.copyWith(
        backgroundColor: AppColors.primaryBackground,
        iconTheme: const IconThemeData(color: Colors.white),
        titleTextStyle: const TextStyle(color: Colors.white, fontSize: 18),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        hintStyle: TextStyle(color: AppColors.textSecondary),
        border: InputBorder.none,
      ),
      textSelectionTheme: const TextSelectionThemeData(
        cursorColor: AppColors.primaryAccent,
      ),
      textTheme: theme.textTheme.copyWith(
        titleLarge: const TextStyle(color: Colors.white, fontSize: 18),
      ),
    );
  }

  @override
  List<Widget> buildActions(BuildContext context) {
    return [
      if (query.isNotEmpty)
        IconButton(
          icon: const Icon(Icons.clear),
          onPressed: () {
            query = '';
            showSuggestions(context);
          },
        ),
    ];
  }

  @override
  Widget buildLeading(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () {
        close(context, '');
      },
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    if (query.isEmpty) {
      return Container(color: AppColors.primaryBackground);
    }

    return FutureBuilder<List<Coin>>(
      future: _assetRepository.searchCoins(query),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Container(
            color: AppColors.primaryBackground,
            child: const Center(child: CircularProgressIndicator()),
          );
        }

        if (snapshot.hasError) {
          return Container(
            color: AppColors.primaryBackground,
            child: Center(
              child: Text(
                'Error: ${snapshot.error}',
                style: const TextStyle(color: AppColors.error),
              ),
            ),
          );
        }

        final coins = snapshot.data ?? [];

        if (coins.isEmpty) {
          return Container(
            color: AppColors.primaryBackground,
            child: Center(
              child: Text(
                'No coins found for "$query"',
                style: const TextStyle(color: AppColors.textSecondary),
              ),
            ),
          );
        }

        return Container(
          color: AppColors.primaryBackground,
          child: ListView.builder(
            itemCount: coins.length,
            itemBuilder: (context, index) {
              final coin = coins[index];
              return CoinListItem(
                coin: coin,
                heroTagPrefix: 'search',
                onTap: () {
                  // Close search and navigate
                  // close(context, coin.symbol); // Option 1: Return result
                  // Option 2: Navigate directly
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => CoinDetailScreen(
                        coin: coin,
                        heroTag: 'search_${coin.symbol}',
                      ),
                    ),
                  );
                },
              );
            },
          ),
        );
      },
    );
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    // For suggestions, we could show recent searches or just run the search as they type
    // Since we are calling an API, maybe we should debounce or just wait for enter?
    // But standard SearchDelegate runs buildSuggestions on every keystroke.
    // To avoid API spam, we can just return empty or recent searches here,
    // OR we can implement a debounced search.
    // Given the user wants "search bar can search all coins", let's try to search as they type but maybe with a small delay or just rely on the user hitting enter (buildResults).
    // However, usually users expect results as they type.
    // Let's implement search in suggestions too, but maybe we should use a local list if available?
    // The requirement is "search all coins in assets".

    if (query.isEmpty) {
      return Container(
        color: AppColors.primaryBackground,
        child: const Center(
          child: Text(
            'Enter coin name or symbol',
            style: TextStyle(color: AppColors.textSecondary),
          ),
        ),
      );
    }

    // We'll use the same logic as buildResults for now, effectively searching as they type.
    // Note: This might spam the API. In a production app, we'd debounce.
    // For this task, I'll assume it's acceptable or I can add a simple debounce if I had a stateful widget, but SearchDelegate is not a widget.
    // Actually, FutureBuilder handles it okay-ish, but it will fire new futures.

    return buildResults(context);
  }
}
