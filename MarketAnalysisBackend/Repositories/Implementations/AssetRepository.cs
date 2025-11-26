using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace MarketAnalysisBackend.Repositories.Implementations
{
    public class AssetRepository : GenericRepository<Asset>, IAssetRepository
    {
        private readonly AppDbContext _context;
        public AssetRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task DeleteAllAsync()
        {
            _context.Assets.RemoveRange(_context.Assets);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Asset>> GetByPagination(int from, int to)
        {
            var totalItems = await _context.Assets.CountAsync();

            var assets = await _context.Assets
                .OrderBy(a => a.Rank)
                .Skip(from)
                .Take(to - from + 1)
                .AsNoTracking()
                .ToListAsync();

            return assets;
        }

        public async Task<IEnumerable<Asset>> GetByRank()
        {
            return await _context.Assets.AsNoTracking().OrderBy(a => Convert.ToInt32(a.Rank)).ToListAsync();
        }

        public async Task<IEnumerable<Asset>> SearchAssetsAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return new List<Asset>();
            }

            var lowerQuery = query.ToLower();

            var assets = await _context.Assets
                .AsNoTracking()
                .Where(a => a.Name.ToLower().Contains(lowerQuery) || a.Symbol.ToLower().Contains(lowerQuery))
                .ToListAsync();

            return assets
                .OrderByDescending(a => a.Symbol.ToLower() == lowerQuery) // Exact symbol match first
                .ThenByDescending(a => a.Symbol.ToLower().StartsWith(lowerQuery)) // Symbol starts with query second
                .ThenByDescending(a => a.Name.ToLower().StartsWith(lowerQuery)) // Name starts with query third
                .ThenBy(a => a.Rank) // Then by rank
                .ToList();
        }
    }
}
