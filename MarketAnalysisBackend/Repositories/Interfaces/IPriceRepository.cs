using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;

namespace MarketAnalysisBackend.Repositories.Interfaces
{
    public interface IPriceRepository : IGenericRepository<PricePoint>
    {
        Task<IEnumerable<PricePointDTO>> GetPricesAsync(string symbol, DateTime? from, DateTime? to);
        Task<IEnumerable<OhlcDto>> GetPricesAsync(string symbol, string timeframe, DateTime? from, DateTime? to);
        Task<IEnumerable<PricePointDTO>> GetAllPricesAsync();
        Task DeleteAllAsync();

    }


}
 