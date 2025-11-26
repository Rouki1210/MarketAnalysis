using MarketAnalysisBackend.Models;

namespace MarketAnalysisBackend.Services.Implementations
{
    public interface IAssetService
    {
        Task<IEnumerable<Asset>> GetAllAssetsAsync();
        Task<IEnumerable<Asset>> GetAllAssetsByRankAsync();
        Task AddAssetAsync(Asset asset);
        Task<IEnumerable<Asset>> RefreshTopAssetAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<Asset>> GetByPagination(int pageNumber, int pageSize);
        Task<IEnumerable<Asset>> GetAllAssetByDateAsynnc();
        Task<IEnumerable<Asset>> GetAllAssetByViewAsynnc();
        Task<Asset?> GetAssetBySymbolAsync(string symbol);
        Task DeleteAllAsync();
    }
}
