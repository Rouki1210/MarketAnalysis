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

        public async Task<IEnumerable<PricePointDTO>> GetPricesAsync(string symbol, DateTime? from, DateTime? to)
        {
            var query = _context.PricePoints
                .Include(p => p.Asset)
                .Where(p => p.Asset.Symbol == symbol);

            if (from.HasValue) query = query.Where(p => p.TimestampUtc >= from.Value);
            if (to.HasValue) query = query.Where(p => p.TimestampUtc  <= to.Value);

            return await query.Select(p => new PricePointDTO
            {
                Id = p.Id,
                Symbol = p.Asset.Symbol,
                Close = p.Close,
                Volume = p.Volume,
                TimestampUtc = p.TimestampUtc,
                Source = p.Source
            }).ToListAsync();
        }

        public async Task DeleteAllAsync()
        {
            _context.PricePoints.RemoveRange(_context.PricePoints);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<PricePointDTO>> GetAllPricesAsync()
        {
            return await _context.PricePoints
                .Include(p => p.Asset)
                .Select(p =>  new PricePointDTO
                {
                    Id = p.Id,
                    Symbol = p.Asset.Symbol,
                    Close = p.Close,
                    Volume = p.Volume,
                    TimestampUtc = p.TimestampUtc,
                    Source = p.Source,
                }).ToListAsync();
        }
    }
}
