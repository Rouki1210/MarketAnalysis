using MarketAnalysisBackend.Models;

namespace MarketAnalysisBackend.Services.Implementations
{
    public interface IPriceService 
    {
        Task<IEnumerable<PricePointDTO>> GetPricePointsAsync(string symbol, DateTime? from, DateTime? to);

        Task<IEnumerable<PricePointDTO>> GetAllPriceAsync();
        Task DeleteAllAsync();
    }
}
