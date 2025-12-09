import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../viewmodels/market_viewmodel.dart';
import '../../widgets/coin_list_item.dart';
import '../../widgets/loading_shimmer.dart';
import '../../widgets/profile_button.dart';
import '../../widgets/user_menu_drawer.dart';
import '../../widgets/fear_greed_gauge.dart';
import '../../views/market/coin_detail_screen.dart';
import '../../views/market/coin_search_delegate.dart';
import '../../widgets/market_overview_sheet.dart';

/// Markets screen with tabs
class MarketsScreen extends StatefulWidget {
  const MarketsScreen({super.key});

  @override
  State<MarketsScreen> createState() => _MarketsScreenState();
}

class _MarketsScreenState extends State<MarketsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<String> _tabs = const [
    'Top',
    'Trending',
    'Most Visited',
    'New',
    'Gainers',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(_onTabChanged);

    // Load coins on init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MarketViewModel>().loadCoins();
    });
  }

  @override
  void dispose() {
    _tabController.removeListener(_onTabChanged);
    _tabController.dispose();
    super.dispose();
  }

  void _onTabChanged() {
    if (_tabController.indexIsChanging) {
      context.read<MarketViewModel>().setSelectedTab(
        _tabs[_tabController.index],
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Markets'),
        actions: [
          // Filter Button
          PopupMenuButton<String>(
            icon: const Icon(Icons.filter_list),
            tooltip: 'Filter',
            onSelected: (value) {
              context.read<MarketViewModel>().sortBy(value);
            },
            itemBuilder: (BuildContext context) {
              final vm = context.read<MarketViewModel>();
              return [
                PopupMenuItem(
                  value: 'marketCap',
                  child: Row(
                    children: [
                      Text(
                        'Market Cap',
                        style: TextStyle(
                          color: vm.sortField == 'marketCap'
                              ? AppColors.primaryAccent
                              : null,
                          fontWeight: vm.sortField == 'marketCap'
                              ? FontWeight.bold
                              : FontWeight.normal,
                        ),
                      ),
                      if (vm.sortField == 'marketCap') ...[
                        const SizedBox(width: 8),
                        Icon(
                          vm.sortAscending
                              ? Icons.arrow_upward
                              : Icons.arrow_downward,
                          size: 16,
                          color: AppColors.primaryAccent,
                        ),
                      ],
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'volume',
                  child: Row(
                    children: [
                      Text(
                        'Volume (24h)',
                        style: TextStyle(
                          color: vm.sortField == 'volume'
                              ? AppColors.primaryAccent
                              : null,
                          fontWeight: vm.sortField == 'volume'
                              ? FontWeight.bold
                              : FontWeight.normal,
                        ),
                      ),
                      if (vm.sortField == 'volume') ...[
                        const SizedBox(width: 8),
                        Icon(
                          vm.sortAscending
                              ? Icons.arrow_upward
                              : Icons.arrow_downward,
                          size: 16,
                          color: AppColors.primaryAccent,
                        ),
                      ],
                    ],
                  ),
                ),
              ];
            },
          ),
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              // Show search dialog
              _showSearchDialog();
            },
          ),
          const ProfileButton(),
        ],
      ),
      endDrawer: const UserMenuDrawer(),
      body: Column(
        children: [
          // Market Overview Bar
          _buildMarketOverviewBar(),

          // Tabs
          Container(
            decoration: const BoxDecoration(
              color: AppColors.secondaryBackground,
              border: Border(
                bottom: BorderSide(color: AppColors.border, width: 1),
              ),
            ),
            child: TabBar(
              controller: _tabController,
              isScrollable: true, // Use scrollable to respect content width
              tabAlignment: TabAlignment.center, // Center the tabs
              labelColor: AppColors.primaryAccent,
              unselectedLabelColor: AppColors.textSecondary,
              indicatorColor: AppColors.primaryAccent,
              indicatorSize: TabBarIndicatorSize.tab,
              labelPadding: const EdgeInsets.symmetric(
                horizontal: 12,
              ), // Balanced spacing
              labelStyle: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
              unselectedLabelStyle: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.normal,
              ),
              tabs: _tabs.map((tab) => Tab(text: tab)).toList(),
            ),
          ),

          // Coin List
          Expanded(
            child: Consumer<MarketViewModel>(
              builder: (context, marketVM, _) {
                if (marketVM.isLoading && marketVM.coins.isEmpty) {
                  return const LoadingShimmer();
                }

                if (marketVM.errorMessage != null) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.error_outline,
                          size: 64,
                          color: AppColors.error,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Failed to load markets',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          marketVM.errorMessage!,
                          style: Theme.of(context).textTheme.bodyMedium,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: () => marketVM.refresh(),
                          icon: const Icon(Icons.refresh),
                          label: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }

                if (marketVM.coins.isEmpty) {
                  return const Center(child: Text('No coins found'));
                }

                return RefreshIndicator(
                  onRefresh: () => marketVM.refresh(),
                  child: ListView.builder(
                    itemCount: marketVM.coins.length,
                    itemBuilder: (context, index) {
                      final coin = marketVM.coins[index];
                      return CoinListItem(
                        coin: coin,
                        heroTagPrefix: 'market',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => CoinDetailScreen(
                                coin: coin,
                                heroTag: 'market_${coin.symbol}',
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: Consumer<MarketViewModel>(
        builder: (context, viewModel, child) {
          // Hide FAB when bottom sheet is showing
          if (viewModel.isMarketOverviewShown) {
            return const SizedBox.shrink();
          }

          return ClipRRect(
            borderRadius: BorderRadius.circular(28),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: FloatingActionButton(
                onPressed: () {
                  viewModel.setMarketOverviewShown(true);
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (context) => const MarketOverviewSheet(),
                  ).whenComplete(() {
                    viewModel.setMarketOverviewShown(false);
                  });
                },
                tooltip: 'Market AI',
                backgroundColor: AppColors.primaryAccent.withOpacity(0.3),
                elevation: 0,
                child: const Text('🤖', style: TextStyle(fontSize: 24)),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildMarketOverviewBar() {
    return Consumer<MarketViewModel>(
      builder: (context, viewModel, child) {
        final overview = viewModel.marketOverview;

        // Format helpers
        String formatMarketCap(double value) {
          if (value >= 1e12) return '\$${(value / 1e12).toStringAsFixed(2)}T';
          if (value >= 1e9) return '\$${(value / 1e9).toStringAsFixed(2)}B';
          return '\$${value.toStringAsFixed(2)}';
        }

        String formatPercent(double value) {
          final sign = value >= 0 ? '+' : '';
          return '$sign${value.toStringAsFixed(2)}%';
        }

        return Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 12,
          ), // Reduced vertical padding
          decoration: const BoxDecoration(
            color: AppColors.secondaryBackground,
            border: Border(
              bottom: BorderSide(color: AppColors.border, width: 1),
            ),
          ),
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Fear & Greed Gauge - Left side
                Container(
                  padding: const EdgeInsets.all(
                    8,
                  ), // Reduced padding inside card
                  decoration: BoxDecoration(
                    color: AppColors.cardBackground,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      Text(
                        'Fear & Greed',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 4), // Reduced spacing
                      FearGreedGauge(
                        value: overview?.fearGreedIndex ?? 50,
                        label: overview?.fearGreedText ?? 'Neutral',
                        size: 140,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12), // Reduced spacing between cards
                // Market metrics - Right side in 2x2 grid
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(
                      8,
                    ), // Reduced padding inside card
                    decoration: BoxDecoration(
                      color: AppColors.cardBackground,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      children: [
                        // First row
                        Row(
                          children: [
                            Expanded(
                              child: _buildCompactMetricItem(
                                'Market Cap',
                                overview != null
                                    ? formatMarketCap(overview.totalMarketCap)
                                    : '--',
                                overview != null
                                    ? formatPercent(
                                        overview.totalMarketCapChange24h,
                                      )
                                    : '--',
                                overview != null
                                    ? overview.totalMarketCapChange24h >= 0
                                    : false,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildCompactMetricItem(
                                '24h Vol',
                                overview != null
                                    ? formatMarketCap(overview.totalVolume24h)
                                    : '--',
                                overview != null
                                    ? formatPercent(
                                        overview.totalVolume24hChange24h,
                                      )
                                    : '--',
                                overview != null
                                    ? overview.totalVolume24hChange24h >= 0
                                    : false,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),

                        // Second row
                        Row(
                          children: [
                            Expanded(
                              child: _buildCompactMetricItem(
                                'BTC Dom',
                                overview != null
                                    ? '${overview.btcDominance.toStringAsFixed(1)}%'
                                    : '--',
                                overview != null
                                    ? formatPercent(overview.btcDominanceChange)
                                    : '--',
                                overview != null
                                    ? overview.btcDominanceChange >= 0
                                    : true,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildCompactMetricItem(
                                'ETH Dom',
                                overview != null
                                    ? '${overview.ethDominance.toStringAsFixed(1)}%'
                                    : '--',
                                overview != null
                                    ? formatPercent(overview.ethDominanceChange)
                                    : '--',
                                overview != null
                                    ? overview.ethDominanceChange >= 0
                                    : false,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCompactMetricItem(
    String label,
    String value,
    String change,
    bool isPositive,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: AppColors.textSecondary,
            fontSize: 11,
          ),
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 4),
        FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
          ),
        ),
        const SizedBox(height: 2),
        if (change != '--')
          Text(
            change,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: isPositive ? AppColors.success : AppColors.error,
              fontSize: 11,
            ),
            overflow: TextOverflow.ellipsis,
          ),
      ],
    );
  }

  void _showSearchDialog() {
    showSearch(context: context, delegate: CoinSearchDelegate());
  }
}
