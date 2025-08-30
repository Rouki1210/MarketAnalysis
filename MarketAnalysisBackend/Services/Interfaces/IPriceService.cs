using MarketAnalysisBackend.Models.DTO;

namespace MarketAnalysisBackend.Services.Implementations
{
    public interface IPriceService 
    {
        Task<IEnumerable<PricePointDTO>> GetPricePointsAsync(string symbol, DateTime? from, DateTime? to);
        Task<IEnumerable<OhlcDto>> GetOhlcDtos(string symbol, string timeframe, DateTime? from, DateTime? to);

        Task<IEnumerable<PricePointDTO>> GetAllPriceAsync();
        Task DeleteAllAsync();
    }
}
