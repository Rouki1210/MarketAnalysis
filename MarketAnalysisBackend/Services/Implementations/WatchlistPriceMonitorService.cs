using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Hubs;
using MarketAnalysisBackend.Models.Alert;
using MarketAnalysisBackend.Repositories.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using static MarketAnalysisBackend.Services.Implementations.WatchlistPriceMonitorService;

namespace MarketAnalysisBackend.Services.Implementations
{
    public interface IWatchlistPriceMonitorService
    {
        Task MonitorAllWatchlistPricesAsync();
    }
    public class WatchlistPriceMonitorService : IWatchlistPriceMonitorService
    {
        private readonly AppDbContext _context;
        private IHubContext<UserAlertHub> _hubContext;
        private readonly IUserAlertHistoryRepository _alertHistoryRepository;
        private readonly IWatchlistRepository _watchlistRepository;
        private readonly ILogger<WatchlistPriceMonitorService> _logger;

        private const decimal PRICE_THRESHOLD_PERCENT = 0.5m; // 0.5% gần target thì trigger
        private const int ALERT_COOLDOWN_HOURS = 24; // Cooldown 24h giữa các alert
        private const decimal AUTO_TARGET_PERCENTAGE = 5m; // Tự động tạo target ±5%
        public WatchlistPriceMonitorService(
            AppDbContext dbContext,
            IHubContext<UserAlertHub> alertHub,
            IUserAlertHistoryRepository alertHistoryRepository,
            IWatchlistRepository watchlistRepository,
            ILogger<WatchlistPriceMonitorService> logger)
        {
            _context = dbContext;
            _hubContext = alertHub;
            _watchlistRepository = watchlistRepository;
            _alertHistoryRepository = alertHistoryRepository;
            _logger = logger;
        }

        public async Task MonitorAllWatchlistPricesAsync()
        {
            try
            {
                var allUsers = await _context.Users.ToListAsync();

                int alertsCreated = 0;
                int totalWatchlistsChecked = 0;

                foreach (var user in allUsers)
                {
                    try
                    {
                        // Lấy tất cả watchlists của user
                        var userWatchlists = await _watchlistRepository.GetWatchlistsByUserIdAsync(user.Id);

                        foreach (var watchlist in userWatchlists)
                        {
                            totalWatchlistsChecked++;

                            // Lấy tất cả assets trong watchlist này
                            if (watchlist.Assets == null || !watchlist.Assets.Any())
                            {
                                continue;
                            }

                            foreach (var asset in watchlist.Assets)
                            {

                                // Lấy giá hiện tại
                                var priceCache = await _context.PriceCaches
                                    .FirstOrDefaultAsync(pc => pc.AssetId == asset.Id);

                                if (priceCache == null || priceCache.CurrentPrice <= 0)
                                {
                                    continue;
                                }

                                var currentPrice = priceCache.CurrentPrice;

                                var targets = GenerateSmartTarget(currentPrice, priceCache);

                                var alertCreated = await CheckAndCreateAlertAsync(
                                    user.Id,
                                    asset.Id,
                                    asset.Symbol,
                                    currentPrice,
                                    targets);

                                if (alertCreated)
                                {
                                    alertsCreated++;
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Lỗi khi xử lý watchlists cho user {UserId}", user.Id);
                    }
                }

                _logger.LogInformation(
                    "✅ Hoàn thành theo dõi. Checked {Watchlists} watchlists, Created {Alerts} alerts",
                    totalWatchlistsChecked, alertsCreated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Lỗi khi theo dõi watchlist prices");
                throw;
            }
        }

        private List<SmartTarget> GenerateSmartTarget(decimal currentPrice, PriceCache priceCache)
        {
            var targets = new List<SmartTarget>();

            if (priceCache.Price24hAgo != null && priceCache.Price24hAgo > 0)
            {
                var change24h = (currentPrice - priceCache.Price24hAgo) / priceCache.Price24hAgo * 100;
                if (change24h > 5)
                {
                    targets.Add(new SmartTarget
                    {
                        Price = currentPrice * 1.05m,
                        Type = "ABOVE",
                        Reason = $"Giá tăng mạnh +{change24h:F1}% - Take profit +5%",
                        Priority = 1
                    });
                }
                else if (change24h < -5)
                {
                    targets.Add(new SmartTarget
                    {
                        Price = currentPrice * 0.95m,
                        Type = "BELOW",
                        Reason = $"Giá giảm mạnh {change24h:F1}% - Mua thêm -5%",
                        Priority = 1
                    });
                }
            }

            var roundTarget = RoundToSignificantLevel(currentPrice);
            if (Math.Abs(roundTarget - currentPrice) > currentPrice * 0.01m) // >1% khác biệt
            {
                targets.Add(new SmartTarget
                {
                    Price = roundTarget,
                    Type = roundTarget > currentPrice ? "ABOVE" : "BELOW",
                    Reason = $" ${roundTarget:F2}",
                    Priority = 2
                });
            }

            if (!targets.Any())
            {
                targets.Add(new SmartTarget
                {
                    Price = currentPrice * 0.95m,
                    Type = "BELOW",
                    Reason = "-5%",
                    Priority = 3
                });

                targets.Add(new SmartTarget
                {
                    Price = currentPrice * 1.05m,
                    Type = "ABOVE",
                    Reason = " +5%",
                    Priority = 3
                });
            }

            return targets.OrderBy(t => t.Priority).ToList();
        }

        private decimal RoundToSignificantLevel(decimal price)
        {
            if (price < 1) return Math.Round(price, 2);
            if (price < 10) return Math.Round(price, 1);
            if (price < 100) return Math.Round(price / 5) * 5;
            if (price < 1000) return Math.Round(price / 10) * 10;
            if (price < 10000) return Math.Round(price / 100) * 100;
            return Math.Round(price / 1000) * 1000;
        }

        private async Task<bool> CheckAndCreateAlertAsync(
            int userId,
            int assetId,
            string assetSymbol,
            decimal currentPrice,
            List<SmartTarget> targets)
        {
            foreach (var target in targets)
            {
                bool shouldAlert = false;

                if (target.Type == "ABOVE" && currentPrice >= target.Price)
                {
                    shouldAlert = true;
                }
                else if (target.Type == "BELOW" && currentPrice <= target.Price)
                {
                    shouldAlert = true;
                }
                else if (target.Type == "REACHES")
                {
                    var percentDiff = Math.Abs((currentPrice - target.Price) / target.Price * 100);
                    if (percentDiff <= PRICE_THRESHOLD_PERCENT)
                    {
                        shouldAlert = true;
                    }
                }

                if (shouldAlert)
                {
                    await CreateAutoAlertAsync(userId, assetId, assetSymbol, target, currentPrice);
                    return true;
                }
            }

            return false;
        }

        private async Task CreateAutoAlertAsync(
           int userId,
           int assetId,
           string assetSymbol,
           SmartTarget target,
           decimal currentPrice)
        {
            try
            {

                var history = new UserAlertHistories
                {
                    UserId = userId,
                    AssetId = assetId,
                    AssetSymbol = assetSymbol,
                    AlertType = "AUTO_WATCHLIST",
                    TargetPrice = target.Price,
                    ActualPrice = currentPrice,
                    PriceDifference = (currentPrice - target.Price) / target.Price * 100,
                    TriggeredAt = DateTime.UtcNow,
                    WasNotified = false,
                    NotificationMethod = "PENDING",
                };

                await _alertHistoryRepository.AddAsync(history);
                await _alertHistoryRepository.SaveChangesAsync();

                // Get asset name for notification
                var asset = await _context.Assets.FirstOrDefaultAsync(a => a.Id == assetId);
                var assetName = asset?.Name ?? assetSymbol;

                await _hubContext.Clients.Group($"user_{userId}")
                    .SendAsync("ReceiveAlert", new
                    {
                        id = history.Id,
                        assetSymbol = assetSymbol,
                        assetName = assetName,
                        targetPrice = target.Price,
                        actualPrice = currentPrice,
                        alertType = "AUTO_WATCHLIST",
                        triggeredAt = history.TriggeredAt,
                        priceDifference = history.PriceDifference
                    });

                _logger.LogInformation(
                    "🔔 Tạo auto alert: User {UserId}, Asset {Symbol}, Target ${Target:F2}, Current ${Current:F2}, Reason: {Reason}",
                    userId, assetSymbol, target.Price, currentPrice, target.Reason);

                history.WasNotified = true;
                history.NotificationMethod = "SIGNALR";
                await _alertHistoryRepository.UpdateAsync(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo auto alert cho user {UserId}, asset {AssetId}", userId, assetId);
            }
        }



        public class SmartTarget
        {
            public decimal Price { get; set; }
            public string Type { get; set; } = "REACHES";
            public string Reason { get; set; } = "";
            public int Priority { get; set; } = 1;
        }

        public class WatchlistMonitorStats
        {
            public int WatchlistAssetCount { get; set; }
            public int AutoAlertsLast7Days { get; set; }
            public DateTime? LastAlertTime { get; set; }
        }
    }

}
