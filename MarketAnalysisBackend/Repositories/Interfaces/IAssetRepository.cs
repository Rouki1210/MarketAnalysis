using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;

namespace MarketAnalysisBackend.Repositories.Interfaces
{
    public interface IAssetRepository : IGenericRepository<Asset>
    {
        Task DeleteAllAsync();
        Task<IEnumerable<Asset>> GetByRank();
        Task<IEnumerable<Asset>> GetByPagination(int from, int to);
        Task<IEnumerable<Asset>> SearchAssetsAsync(string query);
    }
}
