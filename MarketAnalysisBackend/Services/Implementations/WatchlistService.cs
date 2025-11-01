using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Interfaces;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class WatchlistService : IWatchlistService
    {
        private readonly IWatchlistRepository _watchlistRepo;
        public WatchlistService(IWatchlistRepository watchlistRepo)
        {
            _watchlistRepo = watchlistRepo;
        }
        public async Task AddAssetToWatchlistAsync(int watchlistId, int assetId)
        {
            await _watchlistRepo.AddAssetAsync(watchlistId, assetId);
        }

        public async Task<WatchlistDto> CreateWatchlistAsync(int userId, string name)
        {
           return await _watchlistRepo.CreateWatchlistAsync(userId, name);
        }

        public async Task<WatchlistDto> CreateWatchlistDefaultAsync(int userId, int assetId)
        {
            var defaultName = "My Watchlist";
            var existingWatchlists = await _watchlistRepo.GetWatchlistsByUserIdAsync(userId);
            var defaultWatchlist = existingWatchlists.FirstOrDefault(w => w.Name == defaultName);

            if (defaultWatchlist == null)
            {
                defaultWatchlist = await _watchlistRepo.CreateWatchlistAsync(userId, defaultName);
            }

            // Thêm asset nếu chưa có trong watchlist
            await _watchlistRepo.AddAssetAsync(defaultWatchlist.Id, assetId);

            return defaultWatchlist;
        }

        public async Task DeleteWatchlistAsync(int watchlistId)
        {
            await _watchlistRepo.DeleteWatchlistAsync(watchlistId);
        }

        public async Task<WatchlistDto?> GetWatchlistByIdAsync(int watchlistId)
        {
            return await _watchlistRepo.GetWatchlistByIdAsync(watchlistId);
        }

        public async Task<IEnumerable<WatchlistDto>> GetWatchlistsByUserIdAsync(int userId)
        {
            return await _watchlistRepo.GetWatchlistsByUserIdAsync(userId);
        }

        public Task RemoveAssetFromWatchlistAsync(int watchlistId, int assetId)
        {
            return _watchlistRepo.RemoveAssetAsync(watchlistId, assetId);
        }
    }
}
