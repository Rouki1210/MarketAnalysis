using MarketAnalysisBackend.Models.Alert;

namespace MarketAnalysisBackend.Repositories.Interfaces
{
    public interface IGlobalAlertRepository
    {
        Task<IEnumerable<GlobalAlertRule>> GetActiveRulesAsync(CancellationToken cancellationToken = default);
        Task<GlobalAlertRule?> GetRuleByIdAsync(int ruleId, CancellationToken cancellationToken = default);

        // Events
        Task<GlobalAlertEvent> CreateEventAsync(GlobalAlertEvent alertEvent, CancellationToken cancellationToken = default);
        Task<GlobalAlertEvent?> GetLastAlertByRuleAndAssetAsync(int ruleId, int assetId, DateTime since, CancellationToken cancellationToken = default);
        Task<IEnumerable<GlobalAlertEvent>> GetRecentEventsAsync(DateTime since, CancellationToken cancellationToken = default);
        Task UpdateEventStatusAsync(int eventId, string status, int notificationCount, CancellationToken cancellationToken = default);

        // Views
        Task<bool> HasUserViewedAlertAsync(string userId, int alertEventId, CancellationToken cancellationToken = default);
        Task MarkAlertAsViewedAsync(string userId, int alertEventId, string? deviceType = null, CancellationToken cancellationToken = default);

        Task<int> GetAlertCountAsync(DateTime since, CancellationToken cancellationToken = default);
    }

    public interface IPriceCacheRepository
    {
        Task<PriceCache?> GetByAssetIdAsync(int assetId, CancellationToken cancellationToken = default);
        Task<IEnumerable<PriceCache>> GetAllAsync(CancellationToken cancellationToken = default);
        Task UpsertAsync(PriceCache priceCache, CancellationToken cancellationToken = default);
        Task UpsertBulkAsync(IEnumerable<PriceCache> priceCaches, CancellationToken cancellationToken = default);
        Task<DateTime?> GetLastUpdateTimeAsync(CancellationToken cancellationToken = default);
    }


}
