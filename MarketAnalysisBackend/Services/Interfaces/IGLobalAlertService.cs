using MarketAnalysisBackend.Models.Alert;
using MarketAnalysisBackend.Repositories.Interfaces;

namespace MarketAnalysisBackend.Services.Interfaces
{
    public interface IPriceCacheService
    {
        Task UpdatePriceCacheAsync(CancellationToken cancellationToken = default);
        Task<PriceCache?> GetPriceCacheAsync(int assetId, CancellationToken cancellationToken = default);
        Task<IEnumerable<PriceCache>> GetAllPriceCachesAsync(CancellationToken cancellationToken = default);
    }

    public interface IAlertEvaluationService
    {
        Task<GlobalAlertEvent?> EvaluateRuleAsync(GlobalAlertRule rule, PriceCache priceCache, CancellationToken cancellationToken = default);

        Task<bool> IsInCooldownAsync(int ruleId, int assetId, int cooldownMinutes, CancellationToken cancellationToken = default);
    }

    public interface INotificationService
    {
        Task BroadcastAlertAsync(GlobalAlertEvent alertEvent, CancellationToken cancellationToken = default);
        Task<int> GetConnectedClientsCountAsync();
    }

    public interface IGlobalAlertOrchestrationService
    {
        Task ExecuteAlertDetectionCycleAsync(CancellationToken cancellationToken = default);
    }
}
