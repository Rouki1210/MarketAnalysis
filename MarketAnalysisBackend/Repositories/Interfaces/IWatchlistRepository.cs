using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;

namespace MarketAnalysisBackend.Repositories.Interfaces
{
    public interface IWatchlistRepository
    {
        Task<WatchlistDto> CreateWatchlistAsync(int userId, string name);
        Task<IEnumerable<WatchlistDto>> GetWatchlistsByUserIdAsync(int userId);
        Task<WatchlistDto?> GetWatchlistByIdAsync(int watchlistId);
        Task AddAssetAsync(int watchlistId, int assetId);
        Task RemoveAssetAsync(int watchlistId, int assetId);
        Task DeleteWatchlistAsync(int watchlistId);

    }
}
