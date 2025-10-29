using MarketAnalysisBackend.Models.Alert;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Interfaces;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class AlertEvaluationService : IAlertEvaluationService
    {
        private readonly IGlobalAlertRepository _globalAlertRepository;
        private readonly ILogger<AlertEvaluationService> _logger;
        public AlertEvaluationService(IGlobalAlertRepository globalAlertRepository, ILogger<AlertEvaluationService> logger)
        {
            _globalAlertRepository = globalAlertRepository;
            _logger = logger;
        }
        public async Task<GlobalAlertEvent?> EvaluateRuleAsync(GlobalAlertRule rule, PriceCache priceCache, CancellationToken cancellationToken = default)
        {
            if(priceCache.Asset == null)
            {
                _logger.LogWarning("PriceCache for AssetId={AssetId} has no Asset loaded", priceCache.AssetId);
                return null;
            }

            var isInCooldown = await IsInCooldownAsync(rule.Id, priceCache.AssetId, rule.CooldownMinutes, cancellationToken);

            if (isInCooldown)
            {
                _logger.LogTrace("Rule {RuleName} for {Symbol} is in cooldown",
                    rule.RuleName, priceCache.Asset.Symbol);
                return null;
            }

            return rule.RuleType switch
            {
                "PERCENT_CHANGE_1H" => EvaluatePercentChange1H(rule, priceCache),
                "PERCENT_CHANGE_24H" => EvaluatePercentChange24H(rule, priceCache),
                _ => null
            };
        }

        public async Task<bool> IsInCooldownAsync(int ruleId, int assetId, int cooldownMinutes, CancellationToken cancellationToken = default)
        {
            var cooldownTime = DateTime.UtcNow.AddMinutes(-cooldownMinutes);

            var lastAlert = await _globalAlertRepository.GetLastAlertByRuleAndAssetAsync(ruleId, assetId, cooldownTime, cancellationToken);

            return lastAlert != null;
        }

        private GlobalAlertEvent? EvaluatePercentChange1H(GlobalAlertRule rule, PriceCache cache)
        {
            if (cache.Price1hAgo == null || cache.Price1hAgo == 0)
            {
                return null;
            }
            var change = ((cache.CurrentPrice - cache.Price1hAgo) / cache.Price1hAgo) * 100;

            bool triggered = rule.PercentChange > 0
                ? change >= rule.PercentChange
                : change <= rule.PercentChange;
            if (!triggered)
            {
                return null;
            }
            var direction = change > 0 ? "increased" : "decreased";
            var emoji = change > 0 ? "🚀" : "📉";
            var severity = CalculateSeverity(Math.Abs(change));

            return new GlobalAlertEvent
            {
                RuleId = rule.Id,
                AssetId = cache.AssetId,
                AssetSymbol = cache.Asset.Symbol,
                EventType = "PERCENT_CHANGE_1H",
                TriggerValue = cache.CurrentPrice,
                PreviousValue = cache.Price1hAgo,
                PercentChange = change,
                TimeWindow = "1H",
                Message = $"{emoji} {cache.Asset.Symbol} {(change > 0 ? "surged" : "dropped")} {Math.Abs(change):F2}% in 1H! Price: ${cache.CurrentPrice:N2}",
                Severity = severity,
                TriggeredAt = DateTime.UtcNow,
                NotificationStatus = "PENDING"
            };
        }

        private GlobalAlertEvent? EvaluatePercentChange24H(GlobalAlertRule rule, PriceCache cache)
        {
            if (cache.Price24hAgo == null || cache.Price24hAgo == 0)
            {
                return null;
            }
            var change = ((cache.CurrentPrice - cache.Price24hAgo) / cache.Price24hAgo) * 100;
            bool triggered = rule.PercentChange > 0
                ? change >= rule.PercentChange
                : change <= rule.PercentChange;
            if (!triggered)
            {
                return null;
            }

            var direction = change > 0 ? "increased" : "decreased";
            var emoji = change > 0 ? "🚀" : "📉";
            var severity = CalculateSeverity(Math.Abs(change));

            return new GlobalAlertEvent
            {
                RuleId = rule.Id,
                AssetId = cache.AssetId,
                AssetSymbol = cache.Asset.Symbol,
                EventType = "PERCENT_CHANGE_24H",
                TriggerValue = cache.CurrentPrice,
                PreviousValue = cache.Price24hAgo,
                PercentChange = change,
                TimeWindow = "24H",
                Message = $"{emoji} {cache.Asset.Symbol} {(change > 0 ? "surged" : "dropped")} {Math.Abs(change):F2}% in 24H! Price: ${cache.CurrentPrice:N2}",
                Severity = severity,
                TriggeredAt = DateTime.UtcNow,
                NotificationStatus = "PENDING"
            };
        }

        private string CalculateSeverity(decimal change)
        {
            if (change >= 15)
                return "CRITICAL";  
            else if (change >= 8)
                return "HIGH";      
            else if (change >= 4)
                return "MEDIUM";    
            else if (change >= 1)
                return "LOW";       
            else
                return "INFO";
        }
    }
}
