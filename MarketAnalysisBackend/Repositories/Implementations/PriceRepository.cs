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
                Rank = p.Asset.Rank,
                Price = p.Price,
                MarketCap = p.MarketCap,
                Supply = p.CirculatingSupply,
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

            if (!prices.Any())
                return Enumerable.Empty<OhlcDto>();

            // Group by timeframe with enhanced aggregation logic
            // Fallback to Price field when OHLC values are 0 (for legacy data)
            var grouped = prices.GroupBy(p => GetTimeframePeriod(p.TimestampUtc, timeframe))
                .Select(g => new OhlcDto
                {
                    Symbol = symbol,
                    PeriodStart = g.Key,
                    // Use Open, fallback to Close, then to Price
                    Open = g.First().Open != 0 ? g.First().Open 
                         : g.First().Close != 0 ? g.First().Close 
                         : g.First().Price,
                    // Use High, fallback to max of Close values, then to max of Price values
                    High = g.Max(x => x.High != 0 ? x.High 
                         : x.Close != 0 ? x.Close 
                         : x.Price),
                    // Use Low, fallback to min of Close values, then to min of Price values
                    Low = g.Where(x => x.Low > 0 || x.Close > 0 || x.Price > 0)
                           .DefaultIfEmpty(g.First())
                           .Min(x => x.Low > 0 ? x.Low 
                              : x.Close > 0 ? x.Close 
                              : x.Price),
                    // Use Close, fallback to Price
                    Close = g.Last().Close != 0 ? g.Last().Close : g.Last().Price,
                    Volume = g.Sum(x => x.Volume)
                })
                .OrderBy(x => x.PeriodStart)
                .ToList();

            return grouped;
        }

        private DateTime GetTimeframePeriod(DateTime timestamp, string timeframe)
        {
            return timeframe.ToLower() switch
            {
                "1h" => new DateTime(
                    timestamp.Year, 
                    timestamp.Month, 
                    timestamp.Day, 
                    timestamp.Hour, 
                    0, 0, DateTimeKind.Utc),
                
                "4h" => new DateTime(
                    timestamp.Year, 
                    timestamp.Month, 
                    timestamp.Day,
                    (timestamp.Hour / 4) * 4, 
                    0, 0, DateTimeKind.Utc),
                
                "1d" or "24h" => timestamp.Date,
                
                "1w" or "7d" => GetWeekStart(timestamp),
                
                "1m" or "30d" => new DateTime(timestamp.Year, timestamp.Month, 1),
                
                _ => timestamp.Date // Default to daily
            };
        }

        private DateTime GetWeekStart(DateTime date)
        {
            int diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
            return date.AddDays(-1 * diff).Date;
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
                    Rank = p.Asset.Rank,
                    Price = p.Price,
                    Volume = p.Volume,
                    Supply = p.CirculatingSupply,
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
