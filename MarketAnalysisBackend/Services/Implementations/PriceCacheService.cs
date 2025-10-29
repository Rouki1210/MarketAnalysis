using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.Alert;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class PriceCacheService : IPriceCacheService
    {
        private IPriceCacheRepository _priceCacheRepo;
        private AppDbContext _context;
        public PriceCacheService(IPriceCacheRepository priceCacheRepo, AppDbContext context)
        {
            _priceCacheRepo = priceCacheRepo;
            _context = context;
        }
        public async Task<IEnumerable<PriceCache>> GetAllPriceCachesAsync(CancellationToken cancellationToken = default)
        {
            return await _priceCacheRepo.GetAllAsync(cancellationToken);
        }

        public async Task<PriceCache?> GetPriceCacheAsync(int assetId, CancellationToken cancellationToken = default)
        {
            return await _priceCacheRepo.GetByAssetIdAsync(assetId, cancellationToken);
        }

        public async Task UpdatePriceCacheAsync(CancellationToken cancellationToken = default)
        {
            var now = DateTime.UtcNow;
            var time1hAgo = now.AddHours(-1);
            var time24hAgo = now.AddHours(-24);
            var time7dAgo = now.AddDays(-7);

            var assets = await _context.Assets.ToListAsync(cancellationToken);

            var updatedCaches = new List<PriceCache>();

            foreach (var asset in assets)
            {
                if (cancellationToken.IsCancellationRequested)
                    break;

                try
                {
                    var cache = await BuildPriceCacheForAssetAsync(
                        asset,
                        now,
                        time1hAgo,
                        time24hAgo,
                        time7dAgo,
                        cancellationToken);

                    if (cache != null)
                    {
                        updatedCaches.Add(cache);
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception($"Error updating price cache for asset {asset.Id} - {asset.Symbol}: {ex.Message}", ex);
                }
            }

            // Bulk upsert
            if (updatedCaches.Any())
            {
                await _priceCacheRepo.UpsertBulkAsync(updatedCaches, cancellationToken);
            }
        }

        private async Task<PriceCache?> BuildPriceCacheForAssetAsync(
            Asset asset,
            DateTime now,
            DateTime time1hAgo,
            DateTime time24hAgo,
            DateTime time7dAgo,
            CancellationToken cancellationToken)
        {
            var prices = await _context.PricePoints
                .Where(p => p.AssetId == asset.Id && p.TimestampUtc >= time7dAgo)
                .OrderByDescending(p => p.TimestampUtc)
                .ToListAsync(cancellationToken);
            if (!prices.Any())
                return null;
            var latestPrice = prices.First().Price;
            var price1hAgo = prices.FirstOrDefault(p => p.TimestampUtc <= time1hAgo)?.Price ?? latestPrice;
            var price24hAgo = prices.FirstOrDefault(p => p.TimestampUtc <= time24hAgo)?.Price ?? latestPrice;
            var price7dAgo = prices.FirstOrDefault(p => p.TimestampUtc <= time7dAgo)?.Price ?? latestPrice;
            var cache = new PriceCache
            {
                AssetId = asset.Id,
                CurrentPrice = latestPrice,
                Price1hAgo = price1hAgo,
                Price24hAgo = price24hAgo,
                Price7dAgo = price7dAgo,
                LastUpdate = now
            };
            return cache;
        }
    }
}
