import 'package:flutter/material.dart';
import '../models/market_overview_model.dart';
import '../repositories/market_ai_repository.dart';
import '../core/theme/app_colors.dart';

/// Market Overview Bottom Sheet with AI Analysis
class MarketOverviewSheet extends StatefulWidget {
  const MarketOverviewSheet({Key? key}) : super(key: key);

  @override
  State<MarketOverviewSheet> createState() => _MarketOverviewSheetState();
}

class _MarketOverviewSheetState extends State<MarketOverviewSheet> {
  final MarketAiRepository _repository = MarketAiRepository();
  MarketOverviewResponse? _overview;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadOverview();
  }

  Future<void> _loadOverview() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final data = await _repository.getMarketOverview();
      setState(() {
        _overview = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.primaryBackground,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          _buildHeader(),

          // Content
          Expanded(
            child: _isLoading
                ? _buildLoading()
                : _error != null
                ? _buildError()
                : _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primaryAccent,
            AppColors.primaryAccent.withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Row(
        children: [
          const Text('🌍', style: TextStyle(fontSize: 24)),
          const SizedBox(width: 8),
          const Text(
            'Market Overview',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const Spacer(),
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.close, color: Colors.white),
          ),
        ],
      ),
    );
  }

  Widget _buildLoading() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(),
          SizedBox(height: 16),
          Text('AI is analyzing data...'),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: AppColors.error),
          const SizedBox(height: 16),
          Text(_error ?? 'Failed to load market overview'),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _loadOverview, child: const Text('Retry')),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (_overview == null) return const SizedBox();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Trend Badge
          _buildTrendBadge(),
          const SizedBox(height: 16),

          // Stats Grid
          _buildStatsGrid(),
          const SizedBox(height: 16),

          // Insights
          _buildInsights(),
          const SizedBox(height: 16),

          // Top Gainers
          _buildTopMovers('🚀 Top Gainers', _overview!.topGainers, true),
          const SizedBox(height: 16),

          // Top Losers
          _buildTopMovers('📉 Top Losers', _overview!.topLosers, false),
          const SizedBox(height: 16),

          // Meta Info
          _buildMetaInfo(),
        ],
      ),
    );
  }

  Widget _buildTrendBadge() {
    final trend = _overview!.overallTrend;
    Color bgColor;
    Color textColor;
    String icon;

    switch (trend.toLowerCase()) {
      case 'bullish':
        bgColor = AppColors.success.withOpacity(0.2);
        textColor = AppColors.success;
        icon = '📈';
        break;
      case 'bearish':
        bgColor = AppColors.error.withOpacity(0.2);
        textColor = AppColors.error;
        icon = '📉';
        break;
      default:
        bgColor = AppColors.textSecondary.withOpacity(0.2);
        textColor = AppColors.textSecondary;
        icon = '➡️';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: textColor.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(icon, style: const TextStyle(fontSize: 16)),
          const SizedBox(width: 6),
          Text(
            trend.toUpperCase(),
            style: TextStyle(
              color: textColor,
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid() {
    final stats = _overview!.statistics;
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 2,
      children: [
        _buildStatCard('Market Cap', _formatNumber(stats.totalMarketCap)),
        _buildStatCard('24h Volume', _formatNumber(stats.totalVolume24h)),
        _buildStatCard(
          'BTC Dominance',
          '${stats.btcDominance.toStringAsFixed(1)}%',
        ),
        _buildStatCard(
          'Market Breadth',
          '${(stats.marketBreadth * 100).toStringAsFixed(1)}%',
        ),
      ],
    );
  }

  Widget _buildStatCard(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _buildInsights() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: _overview!.insights.map((insight) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: _buildInsightCard(insight),
        );
      }).toList(),
    );
  }

  Widget _buildInsightCard(Insight insight) {
    String icon;
    Color color;

    switch (insight.type.toLowerCase()) {
      case 'positive':
        icon = '✅';
        color = AppColors.success;
        break;
      case 'negative':
        icon = '⚠️';
        color = AppColors.error;
        break;
      default:
        icon = 'ℹ️';
        color = AppColors.primaryAccent;
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(icon, style: const TextStyle(fontSize: 18)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  insight.title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            insight.description,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopMovers(String title, List<TopMover> movers, bool isGainer) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        ...movers.map((mover) => _buildMoverItem(mover, isGainer)),
      ],
    );
  }

  Widget _buildMoverItem(TopMover mover, bool isGainer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.cardBackground.withOpacity(0.5),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            mover.symbol,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
          ),
          Text(
            _formatPercent(mover.percentChange24h),
            style: TextStyle(
              fontWeight: FontWeight.w500,
              fontSize: 13,
              color: isGainer ? AppColors.success : AppColors.error,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetaInfo() {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            _overview!.source,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.textSecondary,
            ),
          ),
          Text(
            _formatDate(_overview!.analyzedAt),
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  String _formatNumber(double num) {
    if (num >= 1e12) return '\$${(num / 1e12).toStringAsFixed(2)}T';
    if (num >= 1e9) return '\$${(num / 1e9).toStringAsFixed(2)}B';
    if (num >= 1e6) return '\$${(num / 1e6).toStringAsFixed(2)}M';
    return '\$${num.toStringAsFixed(0)}';
  }

  String _formatPercent(double num) {
    return '${num >= 0 ? '+' : ''}${num.toStringAsFixed(2)}%';
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${date.month}/${date.day} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}
