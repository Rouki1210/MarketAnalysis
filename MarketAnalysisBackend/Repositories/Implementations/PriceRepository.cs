using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;
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
                Name = p.Asset.Name,
                Price = p.Price,
                MarketCap = p.MarketCap,
                Volume = p.Volume,
                PercentChange1h = p.PercentChange1h,
                PercentChange24h = p.PercentChange24h,
                PercentChange7d = p.PercentChange7d,
                TimestampUtc = p.TimestampUtc,
                Source = p.Source
            }).ToListAsync();
        }
        public async Task<IEnumerable<OhlcDto>> GetPricesAsync(string symbol, string timeframe, DateTime? from, DateTime? to)
        {
            var query = _context.PricePoints
                           .Include(p => p.Asset)
                           .Where(p => p.Asset.Symbol == symbol);

            if (from.HasValue)
                query = query.Where(p => p.TimestampUtc >= from.Value);
            if (to.HasValue)
                query = query.Where(p => p.TimestampUtc <= to.Value);

            var prices = await query
                .OrderBy(p => p.TimestampUtc)
                .ToListAsync();
            var grouped = prices.GroupBy(p => timeframe switch
            {
                "1h" => new DateTime(p.TimestampUtc.Year, p.TimestampUtc.Month, p.TimestampUtc.Day, p.TimestampUtc.Hour, 0, 0),
                "1d" => p.TimestampUtc.Date,
                _ => p.TimestampUtc,
            }).Select(g => new OhlcDto
            {
                Symbol = symbol,
                PeriodStart = g.Key,
                Open = g.First().Open,
                High = g.Max(x => x.High),
                Low = g.Min(x => x.Low),
                Close = g.Last().Close,
                Volume = g.Sum(x => x.Volume)
            });

            return grouped;
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
                    Name = p.Asset.Name,
                    Price = p.Price,
                    Volume = p.Volume,
                    TimestampUtc = p.TimestampUtc,
                    MarketCap = p.MarketCap,
                    PercentChange1h = p.PercentChange1h,
                    PercentChange24h = p.PercentChange24h,
                    PercentChange7d = p.PercentChange7d,
                    Source = p.Source,
                }).ToListAsync();
        }

    }
}
