using MarketAnalysisBackend.Models;

namespace MarketAnalysisBackend.Services.Interfaces
{
    public interface IAssetImport
    {
        Task ImportAssetsAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<Asset>> GetByRankRangeAsync(int from, int to);

        Task<IEnumerable<Asset>> ImportAssetByRank(int fromRank, int toRank, bool updateExisting, CancellationToken cancellationToken = default);

    }
}
