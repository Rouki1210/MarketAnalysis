using MarketAnalysisBackend.Models;

namespace MarketAnalysisBackend.Services.Implementations
{
    public interface IPriceService 
    {
        Task<IEnumerable<PricePoint>> GetPricePointsAsync(string symbol, DateTime? from, DateTime? to);

        Task<IEnumerable<PricePoint>> GetAllPriceAsync();
        Task DeleteAllAsync();
    }
}
