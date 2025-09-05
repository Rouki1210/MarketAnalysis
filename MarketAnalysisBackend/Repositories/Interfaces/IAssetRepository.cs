using MarketAnalysisBackend.Models;

namespace MarketAnalysisBackend.Repositories.Interfaces
{
    public interface IAssetRepository : IGenericRepository<Asset>
    {
        Task DeleteAllAsync();
    }
}
