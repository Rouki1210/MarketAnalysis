using MarketAnalysisBackend.Models.Alert;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.OpenApi.Writers;
using System.Security.Claims;
using static System.Formats.Asn1.AsnWriter;

namespace MarketAnalysisBackend.Services.Implementations.Worker
{
    public class UserAlertBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<UserAlertBackgroundService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5);

        public UserAlertBackgroundService(IServiceProvider serviceProvider, ILogger<UserAlertBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation(
                "🚀 Watchlist Price Monitor Service started - Bắt đầu theo dõi giá watchlist");
            _logger.LogInformation("⏰ Check interval: {Interval}", _checkInterval);

            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                var startTime = DateTime.UtcNow;

                try
                {
                    _logger.LogDebug("🔍 Bắt đầu kiểm tra giá watchlist và user alerts...");

                    // Tạo scope mới cho mỗi lần check
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        // 1. Watchlist Auto Alerts
                        var monitorService = scope.ServiceProvider
                            .GetRequiredService<IWatchlistPriceMonitorService>();
                        await monitorService.MonitorAllWatchlistPricesAsync();

                        // 2. User Custom Price Alerts
                        var userAlertService = scope.ServiceProvider
                            .GetRequiredService<IUserAlertService>();
                        await userAlertService.CheckAndTriggerAlertsAsync();
                    }

                    var duration = DateTime.UtcNow - startTime;
                    _logger.LogDebug("✅ Hoàn thành kiểm tra trong {Duration}ms", duration.TotalMilliseconds);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Lỗi khi theo dõi watchlist prices và user alerts");
                }

                // Đợi đến lần check tiếp theo
                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("🛑 Watchlist Price Monitor Service stopped");
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Stopping Watchlist Price Monitor Service...");
            await base.StopAsync(cancellationToken);
        }
    
    }
}
