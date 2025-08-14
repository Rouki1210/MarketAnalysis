using MarketAnalysisBackend.Models;

namespace MarketAnalysisBackend.Services.Implementations
{
    public interface IAssetService
    {
        Task<IEnumerable<Asset>> GetAllAssetsAsync();
        Task AddAssetAsync(Asset asset);
    }
}
