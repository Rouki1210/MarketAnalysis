using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GlobalMetricController : Controller
    {
        private readonly IGlobalMetricService _globalRepo;
        public GlobalMetricController(IGlobalMetricService globalRepo)
        {
            _globalRepo = globalRepo;
        }

        [HttpGet("global-metric")]
        public async Task<IActionResult> GetGlobalMetric(CancellationToken cancellationToken)
        {
            var result = await _globalRepo.FetchAndSaveMetricsAsync(cancellationToken);
            return Ok(result);
        }

    }
}
