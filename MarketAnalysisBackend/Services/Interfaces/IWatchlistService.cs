using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;

namespace MarketAnalysisBackend.Services.Interfaces
{
    public interface IWatchlistService
    {
        Task<WatchlistDto> CreateWatchlistAsync(int userId, string name);
        Task<IEnumerable<WatchlistDto?>> GetWatchlistsByUserIdAsync(int userId);
        Task<WatchlistDto?> GetWatchlistByIdAsync(int watchlistId);
        Task<WatchlistDto> CreateWatchlistDefaultAsync(int userId, int assetId);
        Task AddAssetToWatchlistAsync(int watchlistId, int assetId);
        Task RemoveAssetFromWatchlistAsync(int watchlistId, int assetId);
        Task DeleteWatchlistAsync(int watchlistId);
    }
}
