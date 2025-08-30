using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Implementations;

namespace MarketAnalysisBackend.Services.Interfaces
{
    public class PriceService : IPriceService
    {
        private readonly IPriceRepository _priceRepo;
        public PriceService (IPriceRepository priceRepo)
        {
            _priceRepo = priceRepo;
        }
        public async Task<IEnumerable<PricePointDTO>> GetPricePointsAsync(string symbol, DateTime? from, DateTime? to)
        {
            return await _priceRepo.GetPricesAsync(symbol, from, to);
        }

        public async Task DeleteAllAsync()
        {
           await _priceRepo.DeleteAllAsync();
        }

        public async Task<IEnumerable<PricePointDTO>> GetAllPriceAsync()
        {
            return await _priceRepo.GetAllPricesAsync();
        }
    }
}
