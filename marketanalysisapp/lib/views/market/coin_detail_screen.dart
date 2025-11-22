import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/asset_model.dart';
import '../../viewmodels/market_viewmodel.dart';
import '../../viewmodels/watchlist_viewmodel.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../widgets/price_chart_widget.dart';
import '../../widgets/stat_card.dart';
import '../../viewmodels/alert_viewmodel.dart';
import '../../viewmodels/auth_viewmodel.dart';
import '../alerts/create_alert_dialog.dart';
import '../auth/auth_screens.dart';

class CoinDetailScreen extends StatefulWidget {
  final Coin coin;
  final String? heroTag;

  const CoinDetailScreen({super.key, required this.coin, this.heroTag});

  @override
  State<CoinDetailScreen> createState() => _CoinDetailScreenState();
}

class _CoinDetailScreenState extends State<CoinDetailScreen> {
  String _selectedTimeframe = '24H';
  final List<String> _timeframes = ['1H', '24H', '7D', '30D', '1Y', 'ALL'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryBackground,
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (widget.coin.icon != null)
              Hero(
                tag: widget.heroTag ?? 'coin_icon_${widget.coin.symbol}',
                child: Image.network(
                  widget.coin.icon!,
                  width: 24,
                  height: 24,
                  errorBuilder: (context, error, stackTrace) =>
                      const Icon(Icons.currency_bitcoin, size: 24),
                ),
              ),
            const SizedBox(width: 8),
            Flexible(
              child: Text(widget.coin.name, overflow: TextOverflow.ellipsis),
            ),
            const SizedBox(width: 8),
            Text(
              widget.coin.symbol,
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
                fontWeight: FontWeight.normal,
              ),
            ),
          ],
        ),
        actions: [
          Consumer<WatchlistViewModel>(
            builder: (context, viewModel, child) {
              final isInWatchlist = viewModel.isInMainWatchlist(
                widget.coin.symbol,
              );
              return IconButton(
                icon: Icon(
                  isInWatchlist ? Icons.star : Icons.star_border,
                  color: isInWatchlist ? AppColors.primaryAccent : null,
                ),
                onPressed: () {
                  if (isInWatchlist) {
                    viewModel.removeFromMainWatchlist(widget.coin.symbol);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          '${widget.coin.symbol} removed from watchlist',
                        ),
                      ),
                    );
                  } else {
                    viewModel.addToMainWatchlist(widget.coin.symbol);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          '${widget.coin.symbol} added to watchlist',
                        ),
                      ),
                    );
                  }
                },
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: _handleCreateAlert,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await context.read<MarketViewModel>().refresh();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Price Header
              _buildPriceHeader(),

              const SizedBox(height: 16),

              // Chart
              _buildChart(),

              const SizedBox(height: 24),

              // Market Stats
              _buildMarketStats(),

              const SizedBox(height: 24),

              // About Section
              if (widget.coin.name.isNotEmpty) _buildAboutSection(),

              const SizedBox(height: 80), // Bottom padding
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleCreateAlert() async {
    final authVM = context.read<AuthViewModel>();
    if (!authVM.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please login to set alerts')),
      );
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
      return;
    }

    final result = await showDialog(
      context: context,
      builder: (context) => CreateAlertDialog(
        assetId: widget.coin.id, // Assuming Coin has ID, need to check model
        currentPrice: widget.coin.price,
        symbol: widget.coin.symbol,
      ),
    );

    if (result != null && mounted) {
      print(
        'DEBUG: CoinDetailScreen - Creating alert for assetId: ${widget.coin.id}',
      );
      final success = await context.read<AlertViewModel>().createAlert(result);
      if (mounted) {
        final alertVM = context.read<AlertViewModel>();
        final errorMsg = alertVM.errorMessage ?? '';
        print('DEBUG: CoinDetailScreen - Success: $success, Error: $errorMsg');

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              success
                  ? 'Alert set successfully'
                  : 'Failed to set alert${errorMsg.isNotEmpty ? ': $errorMsg' : ''}',
            ),
            backgroundColor: success ? AppColors.success : AppColors.error,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  Widget _buildPriceHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            Formatters.formatCurrency(widget.coin.price),
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildChangeChip('1H', widget.coin.change1h),
                const SizedBox(width: 8),
                _buildChangeChip('24H', widget.coin.change24h),
                const SizedBox(width: 8),
                _buildChangeChip('7D', widget.coin.change7d),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChangeChip(String label, double change) {
    final isPositive = change >= 0;
    final color = isPositive ? AppColors.success : AppColors.error;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(width: 4),
          Icon(
            isPositive ? Icons.arrow_drop_up : Icons.arrow_drop_down,
            color: color,
            size: 20,
          ),
          Text(
            '${change.abs().toStringAsFixed(2)}%',
            style: TextStyle(
              fontSize: 12,
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChart() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          // Timeframe selector
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _timeframes.map((timeframe) {
                final isSelected = timeframe == _selectedTimeframe;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(timeframe),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        _selectedTimeframe = timeframe;
                      });
                    },
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 16),

          // Chart widget
          SizedBox(
            height: 250,
            child: PriceChartWidget(
              coin: widget.coin,
              timeframe: _selectedTimeframe,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMarketStats() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Market Stats',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: StatCard(
                  label: 'Market Cap',
                  value: Formatters.formatCompactNumber(widget.coin.marketCap),
                  icon: Icons.show_chart,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: StatCard(
                  label: '24h Volume',
                  value: Formatters.formatCompactNumber(widget.coin.volume24h),
                  icon: Icons.sync_alt,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              if (widget.coin.supply != null)
                Expanded(
                  child: StatCard(
                    label: 'Circulating Supply',
                    value: Formatters.formatCompactNumber(widget.coin.supply!),
                    icon: Icons.pie_chart,
                  ),
                ),
              if (widget.coin.supply != null) const SizedBox(width: 12),
              if (widget.coin.rank != null)
                Expanded(
                  child: StatCard(
                    label: 'Rank',
                    value: '#${widget.coin.rank}',
                    icon: Icons.trending_up,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAboutSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'About',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Learn more about ${widget.coin.name} (${widget.coin.symbol})',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: () {
              // TODO: Open external link
            },
            icon: const Icon(Icons.open_in_new),
            label: const Text('Official Website'),
          ),
        ],
      ),
    );
  }
}
