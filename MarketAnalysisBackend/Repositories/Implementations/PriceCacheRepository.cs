using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models.Alert;
using MarketAnalysisBackend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations
{
    public class PriceCacheRepository : IPriceCacheRepository
    {
        private readonly AppDbContext _context;
        public PriceCacheRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<PriceCache>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.PriceCaches.Include(p => p.Asset)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<PriceCache?> GetByAssetIdAsync(int assetId, CancellationToken cancellationToken = default)
        {
            return await _context.PriceCaches
                .Include(p => p.Asset)
                .FirstOrDefaultAsync(p => p.AssetId == assetId, cancellationToken);
        }

        public async Task<DateTime?> GetLastUpdateTimeAsync(CancellationToken cancellationToken = default)
        {
            return await _context.PriceCaches
                .MaxAsync(p => (DateTime?)p.LastUpdate, cancellationToken);
        }

        public async Task UpsertAsync(PriceCache priceCache, CancellationToken cancellationToken = default)
        {
            var existing = await _context.PriceCaches.FindAsync(new object[] { priceCache.AssetId }, cancellationToken);

            if (existing == null)
            {
                _context.PriceCaches.Add(priceCache);
            }
            else
            {
                _context.Entry(existing).CurrentValues.SetValues(priceCache);
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task UpsertBulkAsync(IEnumerable<PriceCache> priceCaches, CancellationToken cancellationToken = default)
        {
            foreach (var priceCache in priceCaches)
            {
                await UpsertAsync(priceCache, cancellationToken);
            }
        }
    }
}
