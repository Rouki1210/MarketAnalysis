using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;

namespace MarketAnalysisBackend.Repositories.Interfaces
{
    public interface IAssetRepository : IGenericRepository<Asset>
    {
        Task DeleteAllAsync();
        Task<IEnumerable<Asset>> GetByPagination(int from, int to);
    }
}
