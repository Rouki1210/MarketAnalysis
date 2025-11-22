import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../core/utils/formatters.dart';
import '../models/asset_model.dart';
import '../views/market/coin_detail_screen.dart';

class CoinListItem extends StatelessWidget {
  final Coin coin;
  final VoidCallback? onTap;
  final String? heroTagPrefix;

  const CoinListItem({
    super.key,
    required this.coin,
    this.onTap,
    this.heroTagPrefix,
  });

  @override
  Widget build(BuildContext context) {
    final heroTag = '${heroTagPrefix ?? 'coin_icon'}_${coin.symbol}';

    return InkWell(
      onTap:
          onTap ??
          () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) =>
                    CoinDetailScreen(coin: coin, heroTag: heroTag),
              ),
            );
          },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: const BoxDecoration(
          border: Border(
            bottom: BorderSide(color: AppColors.border, width: 0.5),
          ),
        ),
        child: Row(
          children: [
            // Rank
            if (coin.rank != null)
              SizedBox(
                width: 32,
                child: Text(
                  '${coin.rank}',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),

            // Icon + Name + Market Cap
            Expanded(
              child: Row(
                children: [
                  // Icon
                  Hero(
                    tag: heroTag,
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceBackground,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: coin.icon != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(16),
                              child: Image.network(
                                coin.icon!,
                                width: 32,
                                height: 32,
                                errorBuilder: (context, error, stackTrace) =>
                                    const Icon(
                                      Icons.currency_bitcoin,
                                      size: 20,
                                      color: AppColors.textSecondary,
                                    ),
                              ),
                            )
                          : const Icon(
                              Icons.currency_bitcoin,
                              size: 20,
                              color: AppColors.textSecondary,
                            ),
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Name & Symbol
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          coin.symbol,
                          style: Theme.of(context).textTheme.titleMedium,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          Formatters.formatMarketCap(coin.marketCap),
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(color: AppColors.textSecondary),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Price
            SizedBox(
              width: 100,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    transitionBuilder:
                        (Widget child, Animation<double> animation) {
                          return FadeTransition(
                            opacity: animation,
                            child: child,
                          );
                        },
                    child: Text(
                      Formatters.formatCurrency(coin.price),
                      key: ValueKey<double>(coin.price),
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 8),

            // 24h Change
            SizedBox(
              width: 80,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: coin.isPositive24h
                          ? AppColors.success.withValues(alpha: 0.1)
                          : AppColors.error.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            coin.isPositive24h
                                ? Icons.arrow_drop_up
                                : Icons.arrow_drop_down,
                            size: 16,
                            color: coin.isPositive24h
                                ? AppColors.success
                                : AppColors.error,
                          ),
                          Flexible(
                            child: Text(
                              Formatters.formatPercentage(
                                coin.change24h.abs(),
                                includeSign: false,
                              ),
                              style: Theme.of(context).textTheme.bodySmall
                                  ?.copyWith(
                                    color: coin.isPositive24h
                                        ? AppColors.success
                                        : AppColors.error,
                                    fontWeight: FontWeight.w600,
                                  ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
