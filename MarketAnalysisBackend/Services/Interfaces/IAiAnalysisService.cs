using MarketAnalysisBackend.Models.AI;

namespace MarketAnalysisBackend.Services.Interfaces
{
    public interface IAiAnalysisService
    {
        Task<CoinAnalysisReponse> AnalyzeCoinAsync(string symbol, CancellationToken cancellationToken = default);
        Task<List<CoinAnalysisReponse>> AnalyzeMultipleCoinsAsync(List<string> symbols, CancellationToken cancellationToken = default);
        Task<MarketOverviewResponse> AnalyzeMarketAsync(CancellationToken cancellationToken = default);
    }
}
