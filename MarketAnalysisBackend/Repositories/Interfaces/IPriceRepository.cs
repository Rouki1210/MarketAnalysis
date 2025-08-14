using MarketAnalysisBackend.Models;

namespace MarketAnalysisBackend.Repositories.Interfaces
{
    public interface IPriceRepository : IGenericRepository<PricePoint>
    {
        Task<IEnumerable<PricePoint>> GetPricesAsync(string symbol, DateTime? from, DateTime? to);
        Task DeleteAllAsync();
    }


}
