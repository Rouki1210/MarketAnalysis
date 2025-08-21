using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations
{
    public class PriceRepository : GenericRepository<PricePoint>, IPriceRepository
    {
        private readonly AppDbContext _context ;
        public PriceRepository(AppDbContext context) : base(context) 
        {
            _context = context;
        }

        public async Task<IEnumerable<PricePoint>> GetPricesAsync(string symbol, DateTime? from, DateTime? to)
        {
            var query = _context.PricePoints
                .Include(p => p.Asset)
                .Where(p => p.Asset.Symbol == symbol);

            if (from.HasValue) query = query.Where(p => p.TimestampUtc >= from.Value);
            if (to.HasValue) query = query.Where(p => p.TimestampUtc  <= to.Value);

            return await query.ToListAsync();
        }

        public async Task DeleteAllAsync()
        {
            _context.PricePoints.RemoveRange(_context.PricePoints);
            await _context.SaveChangesAsync();
        }
    }
}
