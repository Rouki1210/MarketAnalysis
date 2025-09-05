using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

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
    }
}
