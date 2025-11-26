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

        public async Task<Asset?> GetAssetBySymbolAsync(string symbol)
        {
            return await _context.Assets.FirstOrDefaultAsync(a => a.Symbol.ToLower() == symbol.ToLower());
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
    }
}
