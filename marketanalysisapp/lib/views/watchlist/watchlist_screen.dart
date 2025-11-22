import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shimmer/shimmer.dart';
import '../../viewmodels/watchlist_viewmodel.dart';
import '../../viewmodels/auth_viewmodel.dart';
import '../../viewmodels/market_viewmodel.dart';
import '../../models/asset_model.dart';
import '../../core/theme/app_colors.dart';
import '../../widgets/coin_list_item.dart';
import '../../widgets/profile_button.dart';
import '../../widgets/user_menu_drawer.dart';
import '../../widgets/empty_state_widget.dart';
import '../../views/market/coin_detail_screen.dart';

class WatchlistScreen extends StatefulWidget {
  const WatchlistScreen({super.key});

  @override
  State<WatchlistScreen> createState() => _WatchlistScreenState();
}

class _WatchlistScreenState extends State<WatchlistScreen> {
  @override
  void initState() {
    super.initState();
    // Listen to auth changes
    final authVM = context.read<AuthViewModel>();
    authVM.addListener(_onAuthChanged);

    // Load if already authenticated
    if (authVM.isAuthenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.read<WatchlistViewModel>().loadMainWatchlist();
      });
    }
  }

  @override
  void dispose() {
    context.read<AuthViewModel>().removeListener(_onAuthChanged);
    super.dispose();
  }

  void _onAuthChanged() {
    if (!mounted) return;
    final authVM = context.read<AuthViewModel>();
    if (authVM.isAuthenticated) {
      context.read<WatchlistViewModel>().loadMainWatchlist();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthViewModel>(
      builder: (context, authVM, _) {
        return Scaffold(
          backgroundColor: AppColors.primaryBackground,
          appBar: AppBar(
            title: const Text('Watchlist'),
            actions: [
              if (authVM.isAuthenticated)
                IconButton(
                  icon: const Icon(Icons.add),
                  onPressed: () => _showAddCoinDialog(context),
                ),
              const ProfileButton(),
            ],
          ),
          endDrawer: const UserMenuDrawer(),
          body: !authVM.isAuthenticated
              ? _buildGuestState()
              : Consumer<WatchlistViewModel>(
                  builder: (context, watchlistVM, child) {
                    if (watchlistVM.isLoading) {
                      return _buildLoadingState();
                    }

                    if (watchlistVM.errorMessage != null) {
                      return _buildErrorState(watchlistVM);
                    }

                    final watchlist = watchlistVM.mainWatchlist;
                    if (watchlist == null ||
                        watchlist.items == null ||
                        watchlist.items!.isEmpty) {
                      return _buildEmptyState();
                    }

                    return Consumer<MarketViewModel>(
                      builder: (context, marketVM, child) {
                        return RefreshIndicator(
                          onRefresh: () async {
                            await watchlistVM.loadMainWatchlist();
                            await marketVM.loadCoins();
                          },
                          child: ListView.builder(
                            itemCount: watchlist.items!.length,
                            itemBuilder: (context, index) {
                              final item = watchlist.items![index];

                              // Check if market data is loaded
                              if (marketVM.coins.isEmpty) {
                                // Trigger load if empty (and not already loading)
                                if (!marketVM.isLoading) {
                                  WidgetsBinding.instance.addPostFrameCallback((
                                    _,
                                  ) {
                                    marketVM.loadCoins();
                                  });
                                }
                                // Show loading placeholder for this item
                                return Shimmer.fromColors(
                                  baseColor: AppColors.shimmerBase,
                                  highlightColor: AppColors.shimmerHighlight,
                                  child: ListTile(
                                    leading: const CircleAvatar(
                                      backgroundColor: Colors.white,
                                    ),
                                    title: Container(
                                      height: 16,
                                      color: Colors.white,
                                    ),
                                    subtitle: Container(
                                      height: 12,
                                      color: Colors.white,
                                    ),
                                  ),
                                );
                              }

                              // Find coin data
                              final coin = marketVM.coins.firstWhere(
                                (c) => c.symbol == item.assetSymbol,
                                orElse: () => Coin(
                                  id: 0,
                                  name: item.assetSymbol,
                                  symbol: item.assetSymbol,
                                  price: 0,
                                  change1h: 0,
                                  change24h: 0,
                                  change7d: 0,
                                  marketCap: 0,
                                  volume24h: 0,
                                  rank: 0,
                                ),
                              );

                              // If we found the correct coin (or created a dummy one)
                              if (coin.price != 0 ||
                                  coin.name != item.assetSymbol) {
                                // Check if it's a real coin (dummy has price 0)
                                return Dismissible(
                                  key: Key(item.assetSymbol),
                                  direction: DismissDirection.endToStart,
                                  background: Container(
                                    color: AppColors.error,
                                    alignment: Alignment.centerRight,
                                    padding: const EdgeInsets.only(right: 16),
                                    child: const Icon(
                                      Icons.delete,
                                      color: Colors.white,
                                    ),
                                  ),
                                  onDismissed: (direction) {
                                    watchlistVM.removeFromMainWatchlist(
                                      item.assetSymbol,
                                    );
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(
                                          '${item.assetSymbol} removed',
                                        ),
                                      ),
                                    );
                                  },
                                  child: CoinListItem(
                                    coin: coin,
                                    heroTagPrefix: 'watchlist',
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) =>
                                              CoinDetailScreen(
                                                coin: coin,
                                                heroTag:
                                                    'watchlist_${coin.symbol}',
                                              ),
                                        ),
                                      );
                                    },
                                  ),
                                );
                              }

                              // Fallback if coin data not found in market list
                              return ListTile(
                                title: Text(
                                  item.assetSymbol,
                                  style: const TextStyle(color: Colors.white),
                                ),
                                subtitle: Text(
                                  'Data unavailable',
                                  style: TextStyle(
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                                trailing: IconButton(
                                  icon: const Icon(
                                    Icons.delete,
                                    color: AppColors.error,
                                  ),
                                  onPressed: () {
                                    watchlistVM.removeFromMainWatchlist(
                                      item.assetSymbol,
                                    );
                                  },
                                ),
                              );
                            },
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

  Widget _buildGuestState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.lock_outline, size: 64, color: AppColors.textSecondary),
          const SizedBox(height: 16),
          Text(
            'Sign in to view your watchlist',
            style: TextStyle(fontSize: 18, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              Scaffold.of(context).openEndDrawer();
            },
            child: const Text('Log In / Sign Up'),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return ListView.builder(
      itemCount: 5,
      itemBuilder: (context, index) => Shimmer.fromColors(
        baseColor: AppColors.shimmerBase,
        highlightColor: AppColors.shimmerHighlight,
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          height: 80,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }

  Widget _buildErrorState(WatchlistViewModel viewModel) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: AppColors.error),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              viewModel.errorMessage!,
              style: TextStyle(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => viewModel.loadMainWatchlist(),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return EmptyStateWidget(
      title: 'Your watchlist is empty',
      message: 'Add coins to track their performance',
      icon: Icons.bookmark_border,
      buttonText: 'Add Coin',
      onButtonPressed: () => _showAddCoinDialog(context),
    );
  }

  void _showAddCoinDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.cardBackground,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.9,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) {
          return _AddCoinSheet(scrollController: scrollController);
        },
      ),
    );
  }
}

class _AddCoinSheet extends StatefulWidget {
  final ScrollController scrollController;

  const _AddCoinSheet({required this.scrollController});

  @override
  State<_AddCoinSheet> createState() => _AddCoinSheetState();
}

class _AddCoinSheetState extends State<_AddCoinSheet> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: TextField(
            decoration: InputDecoration(
              hintText: 'Search coins...',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              filled: true,
              fillColor: AppColors.surfaceBackground,
            ),
            onChanged: (value) {
              setState(() {
                _searchQuery = value;
              });
            },
          ),
        ),
        Expanded(
          child: Consumer<MarketViewModel>(
            builder: (context, marketVM, child) {
              final coins = marketVM.coins.where((coin) {
                return coin.name.toLowerCase().contains(
                      _searchQuery.toLowerCase(),
                    ) ||
                    coin.symbol.toLowerCase().contains(
                      _searchQuery.toLowerCase(),
                    );
              }).toList();

              return ListView.builder(
                controller: widget.scrollController,
                itemCount: coins.length,
                itemBuilder: (context, index) {
                  final coin = coins[index];
                  return ListTile(
                    leading: coin.icon != null
                        ? Image.network(
                            coin.icon!,
                            width: 32,
                            height: 32,
                            errorBuilder: (_, __, ___) =>
                                const Icon(Icons.monetization_on),
                          )
                        : const Icon(Icons.monetization_on),
                    title: Text(
                      coin.name,
                      style: const TextStyle(color: Colors.white),
                    ),
                    subtitle: Text(
                      coin.symbol,
                      style: TextStyle(color: AppColors.textSecondary),
                    ),
                    trailing: IconButton(
                      icon: const Icon(
                        Icons.add_circle_outline,
                        color: AppColors.primaryAccent,
                      ),
                      onPressed: () {
                        context.read<WatchlistViewModel>().addToMainWatchlist(
                          coin.symbol,
                        );
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('${coin.name} added')),
                        );
                        Navigator.pop(context);
                      },
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}
