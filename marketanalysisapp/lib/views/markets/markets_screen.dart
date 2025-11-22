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

/// Markets screen with tabs
class MarketsScreen extends StatefulWidget {
  const MarketsScreen({super.key});

  @override
  State<MarketsScreen> createState() => _MarketsScreenState();
}

class _MarketsScreenState extends State<MarketsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchController = TextEditingController();

  final List<String> _tabs = const [
    'Top',
    'Trending',
    'Most Visited',
    'New',
    'Gainers',
    'Real-World Assets',
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
    _searchController.dispose();
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
              isScrollable: true,
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
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(
            color: AppColors.secondaryBackground,
            border: Border(
              bottom: BorderSide(color: AppColors.border, width: 1),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Fear & Greed Gauge - Left side
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.cardBackground,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Fear & Greed',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    FearGreedGauge(
                      value: overview?.fearGreedIndex ?? 50,
                      label: overview?.fearGreedText ?? 'Neutral',
                      size: 140,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),

              // Market metrics - Right side in 2x2 grid
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
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
                      const SizedBox(height: 12),

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
        const SizedBox(height: 6),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
          overflow: TextOverflow.ellipsis,
        ),
        if (change != '--') const SizedBox(height: 2),
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
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Search Coins'),
          content: TextField(
            controller: _searchController,
            decoration: const InputDecoration(
              hintText: 'Search by name or symbol',
              prefixIcon: Icon(Icons.search),
            ),
            onChanged: (value) {
              context.read<MarketViewModel>().setSearchQuery(value);
            },
            autofocus: true,
          ),
          actions: [
            TextButton(
              onPressed: () {
                _searchController.clear();
                context.read<MarketViewModel>().setSearchQuery('');
                Navigator.of(context).pop();
              },
              child: const Text('Clear'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }
}
