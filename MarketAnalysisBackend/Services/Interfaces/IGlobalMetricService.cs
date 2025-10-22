using MarketAnalysisBackend.Models;

namespace MarketAnalysisBackend.Services.Interfaces
{
    public interface IGlobalMetricService
    {
        Task<Global_metric> FetchAndSaveMetricsAsync(CancellationToken cancellationToken);
    }
}
