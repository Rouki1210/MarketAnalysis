import 'package:flutter/material.dart';
import '../models/coin_analysis_model.dart';
import '../repositories/market_ai_repository.dart';
import '../core/theme/app_colors.dart';

/// Coin AI Analysis Bottom Sheet
class CoinAnalysisSheet extends StatefulWidget {
  final String symbol;

  const CoinAnalysisSheet({Key? key, required this.symbol}) : super(key: key);

  @override
  State<CoinAnalysisSheet> createState() => _CoinAnalysisSheetState();
}

class _CoinAnalysisSheetState extends State<CoinAnalysisSheet> {
  final MarketAiRepository _repository = MarketAiRepository();
  CoinAnalysisResponse? _analysis;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadAnalysis();
  }

  Future<void> _loadAnalysis() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final data = await _repository.getCoinAnalysis(widget.symbol);
      setState(() {
        _analysis = data;
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
          _buildHeader(),
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
          const Text('🤖', style: TextStyle(fontSize: 24)),
          const SizedBox(width: 8),
          const Text(
            'AI Analysis',
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
          Text(_error ?? 'Failed to load analysis'),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _loadAnalysis, child: const Text('Retry')),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (_analysis == null) return const SizedBox();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Price Info
          _buildPriceInfo(),
          const SizedBox(height: 16),

          // Insights
          ...(_analysis!.insights.map(
            (insight) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: _buildInsightCard(insight),
            ),
          )),

          // Disclaimer
          const SizedBox(height: 16),
          _buildDisclaimer(),

          // Meta
          const SizedBox(height: 12),
          _buildMetaInfo(),
        ],
      ),
    );
  }

  Widget _buildPriceInfo() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Current Price:', style: TextStyle(fontSize: 13)),
              Text(
                '\$${_analysis!.currentPrice.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('7-Day Change:', style: TextStyle(fontSize: 13)),
              Text(
                '${_analysis!.percentChange7d >= 0 ? '+' : ''}${_analysis!.percentChange7d.toStringAsFixed(2)}%',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: _analysis!.percentChange7d >= 0
                      ? AppColors.success
                      : AppColors.error,
                ),
              ),
            ],
          ),
        ],
      ),
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

  Widget _buildDisclaimer() {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.error.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.error.withOpacity(0.3)),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('⚠️', style: TextStyle(fontSize: 16)),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              'This is AI-generated analysis for reference only, not investment advice. Please do your own research before making any decisions.',
              style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetaInfo() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          _analysis!.source,
          style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
        ),
        Text(
          _formatDate(_analysis!.analyzedAt),
          style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
        ),
      ],
    );
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
