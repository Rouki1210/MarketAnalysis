using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations
{
    public class WatchlistRepository : IWatchlistRepository
    {
        private readonly AppDbContext _context;
        public WatchlistRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddAssetAsync(int watchlistId, int assetId)
        {
            bool exists = await _context.WatchlistItems 
                    .AnyAsync(wi => wi.WatchlistId == watchlistId && wi.AssetId == assetId);

            if (exists)
                throw new InvalidOperationException("Asset already exists in this watchlist.");

            var item = new WatchlistItems
            {
                WatchlistId = watchlistId,
                AssetId = assetId,
            };

            await _context.WatchlistItems.AddAsync(item);
            await _context.SaveChangesAsync();
        }

        public async Task<WatchlistDto> CreateWatchlistAsync(int userId, string name)
        {
            bool userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
                throw new InvalidOperationException("User not found.");
            bool duplicate = await _context.Watchlists
                    .AnyAsync(w => w.UserId == userId && w.Name.ToLower() == name.ToLower());
            if (duplicate)
                throw new InvalidOperationException("A watchlist with this name already exists for this user.");

            var watchlist = new Watchlist
            {
                UserId = userId,
                Name = name,
                IsFavorite = false
            };

            await _context.Watchlists.AddAsync(watchlist);
            await _context.SaveChangesAsync();
            return new WatchlistDto
            {
                Id = watchlist.Id,
                Name = watchlist.Name,
                Assets = new List<AssetDto>()
            };
        }

        public Task DeleteWatchlistAsync(int watchlistId)
        {
            var watchlist = _context.Watchlists
                .Include(w => w.WatchlistItems)
                .FirstOrDefault(w => w.Id == watchlistId);
            if (watchlist == null)
                throw new InvalidOperationException("Watchlist not found.");
            _context.Watchlists.Remove(watchlist);
            return _context.SaveChangesAsync();
        }

        public async Task<WatchlistDto?> GetWatchlistByIdAsync(int watchlistId)
        {
            bool exists = _context.Watchlists.Any(w => w.Id == watchlistId);
            if (!exists)
                throw new InvalidOperationException("Watchlist not found.");
            var watchlist = await _context.Watchlists
                .Include(w => w.WatchlistItems)
                    .ThenInclude(wi => wi.Asset)
                .FirstOrDefaultAsync(w => w.Id == watchlistId);

            if (watchlist == null)
                return null;

            return new WatchlistDto
            {
                Id = watchlist.Id,
                Name = watchlist.Name,
                Assets = watchlist.WatchlistItems.Select(wi => new AssetDto
                {
                    Id = wi.Asset.Id,
                    Symbol = wi.Asset.Symbol,
                    Name = wi.Asset.Name,
                }).ToList()
            };
        }

        public async Task<IEnumerable<WatchlistDto>> GetWatchlistsByUserIdAsync(int userId)
        {
            bool userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
                throw new InvalidOperationException("User not found.");

            var watchlists = await _context.Watchlists
                .Where(w => w.UserId == userId)
                .Include(w => w.WatchlistItems).ThenInclude(wi => wi.Asset)
                .Select(w => new WatchlistDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Assets = w.WatchlistItems.Select(wi => new AssetDto
                    {
                        Id = wi.Asset.Id,
                        Name = wi.Asset.Name,
                        Symbol = wi.Asset.Symbol,
                    }).ToList()
                })
                .ToListAsync();

            return watchlists;
        }

        public async Task RemoveAssetAsync(int watchlistId, int assetId)
        {
            var assetInWatchlist = await _context.WatchlistItems
                .FirstOrDefaultAsync(wi => wi.WatchlistId == watchlistId && wi.AssetId == assetId);
            if (assetInWatchlist == null)
                throw new InvalidOperationException("Asset not found in this watchlist.");

            _context.WatchlistItems.Remove(assetInWatchlist);
            await _context.SaveChangesAsync();
        }
    }
}
