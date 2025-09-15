using MarketAnalysisBackend.Models;

namespace MarketAnalysisBackend.Services.Implementations
{
    public interface IAssetService
    {
        Task<IEnumerable<Asset>> GetAllAssetsAsync();
        Task AddAssetAsync(Asset asset);
        Task<IEnumerable<Asset>> RefreshTopAssetAsync(CancellationToken cancellationToken = default);
        Task DeleteAllAsync();
    }
}
