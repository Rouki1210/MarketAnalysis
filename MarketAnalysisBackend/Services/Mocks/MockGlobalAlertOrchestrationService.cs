using MarketAnalysisBackend.Hubs;
using MarketAnalysisBackend.Repositories.Implementations;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Implementations;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Services.Mocks
{
    public class MockGlobalAlertOrchestrationService : IGlobalAlertOrchestrationService
    {
        private readonly ILogger<MockGlobalAlertOrchestrationService> _logger;
        private readonly IAssetService _assetSer;
        private static readonly Random _rand = new();
        private readonly IHubContext<AlertHub>? _hubContext;

        public MockGlobalAlertOrchestrationService(ILogger<MockGlobalAlertOrchestrationService> logger, IAssetService assetSer, IHubContext<AlertHub>? hubContext)
        {
            _logger = logger;
            _assetSer = assetSer;
            _hubContext = hubContext;
        }

        public async Task ExecuteAlertDetectionCycleAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("⚡ Mock orchestration started at {Time}", DateTime.UtcNow);

            // Giả lập việc kiểm tra một vài tài sản
            var assets = await _assetSer.GetAllAssetsAsync();
            if (assets == null || !assets.Any())
            {
                _logger.LogWarning("⚠️ No assets found in repository.");
                return;
            }
            foreach (var asset in assets)
            {
                var percentChange = Math.Round((_rand.NextDouble() * 10 - 5), 2); // -5% → +5%
                if (Math.Abs(percentChange) > 2.5)
                {
                    _logger.LogWarning(
                        "🚨 [MOCK ALERT] {Asset} changed {Change}% in 1H (severity: {Severity})",
                        asset,
                        percentChange,
                        CalculateSeverity(percentChange)
                    );
                    if (_hubContext != null)
                    {
                        await _hubContext.Clients.All.SendAsync("ReceiveGlobalAlert", new
                        {
                            assetSymbol = asset.Symbol,
                            message = $"{asset.Symbol} changed {percentChange}% in 1H (Severity: {CalculateSeverity(percentChange)})",
                            severity = CalculateSeverity(percentChange),
                            triggeredAt = DateTime.UtcNow
                        });
                    }
                }
                else
                {
                    _logger.LogInformation(
                        "✅ {Asset} stable ({Change}%)",
                        asset,
                        percentChange
                    );
                }

                await Task.Delay(300, cancellationToken); // giả lập latency xử lý từng asset
            }

            _logger.LogInformation("✅ Mock orchestration cycle completed at {Time}", DateTime.UtcNow);
        }

        private string CalculateSeverity(double change)
        {
            var abs = Math.Abs(change);
            if (abs >= 10) return "CRITICAL";
            if (abs >= 5) return "HIGH";
            if (abs >= 2) return "MEDIUM";
            return "LOW";
        }
    }
}
