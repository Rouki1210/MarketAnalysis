using MarketAnalysisBackend.Models.Alert;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Interfaces;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class GlobalAlertOrchestrationService : IGlobalAlertOrchestrationService
    {
        private readonly IPriceCacheService _pricecacheSer;
        private readonly IAlertEvaluationService _alertEvaluationSer;
        private readonly INotificationService _notiSer;
        private readonly IGlobalAlertRepository _alertRepo;
        private readonly ILogger<GlobalAlertOrchestrationService> _logger;
        public GlobalAlertOrchestrationService(IPriceCacheService pricecacheSer, IAlertEvaluationService alertEvaluationSer, INotificationService notiSer, IGlobalAlertRepository alertRepo, ILogger<GlobalAlertOrchestrationService> logger)
        {
            _pricecacheSer = pricecacheSer;
            _alertEvaluationSer = alertEvaluationSer;
            _notiSer = notiSer;
            _alertRepo = alertRepo;
            _logger = logger;
        }

        public async Task ExecuteAlertDetectionCycleAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                await UpdatePriceCacheAsync(cancellationToken);
                await DetectAndProcessAlertAsync(cancellationToken);

                _logger.LogDebug("✅ Alert detection cycle completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error in alert detection cycle");
                throw;
            }
        }

        private async Task UpdatePriceCacheAsync(CancellationToken cancellationToken)
        {
            _logger.LogTrace("Starting price cache update...");
            var startTime = DateTime.UtcNow;

            await _pricecacheSer.UpdatePriceCacheAsync(cancellationToken);

            var duration = DateTime.UtcNow - startTime;
            _logger.LogDebug("Price cache updated in {Duration}ms", duration.TotalMilliseconds);
        }

        private async Task DetectAndProcessAlertAsync(CancellationToken cancellationToken)
        {
            _logger.LogTrace("Starting alert detection...");

            // Get active rules
            var rules = await _alertRepo.GetActiveRulesAsync(cancellationToken);

            if (!rules.Any())
            {
                _logger.LogDebug("No active alert rules found");
                return;
            }

            // Get all price caches
            var priceCaches = await _pricecacheSer.GetAllPriceCachesAsync(cancellationToken);

            var triggeredCount = 0;

            foreach (var rule in rules)
            {
                if (cancellationToken.IsCancellationRequested)
                    break;

                // Fix: Use rule.Asset?.Id instead of rule.AssetId
                var assetsToCheck = rule.Asset != null
                    ? priceCaches.Where(p => p.AssetId == rule.Asset.Id)
                    : priceCaches;

                foreach (var priceCache in assetsToCheck)
                {
                    if (cancellationToken.IsCancellationRequested)
                        break;
                    try
                    {
                        // Evaluate rule
                        var triggeredEvent = await _alertEvaluationSer.EvaluateRuleAsync(
                            rule,
                            priceCache,
                            cancellationToken);

                        if (triggeredEvent != null)
                        {
                            await ProcessTriggeredAlertAsync(triggeredEvent, cancellationToken);
                            triggeredCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex,
                            "Error evaluating rule {RuleName} for asset {Symbol}",
                            rule.RuleName,
                            priceCache.Asset?.Symbol ?? "Unknown");
                    }
                }
            }
            if (triggeredCount > 0)
            {
                _logger.LogInformation("🔔 Triggered {Count} alerts in this cycle", triggeredCount);
            }
        }

        private async Task ProcessTriggeredAlertAsync(
            GlobalAlertEvent alertEvent,
            CancellationToken cancellationToken)
        {
            var savedEvent = await _alertRepo.CreateEventAsync(alertEvent, cancellationToken);

            _logger.LogInformation(
                "Alert created: ID={Id}, {Symbol} {EventType} {Message}",
                savedEvent.Id,
                savedEvent.AssetSymbol,
                savedEvent.EventType,
                savedEvent.Message);

            await _notiSer.BroadcastAlertAsync(savedEvent, cancellationToken);
        }
    } 
}
