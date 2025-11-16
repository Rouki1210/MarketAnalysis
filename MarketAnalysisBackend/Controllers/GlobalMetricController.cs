using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GlobalMetricController : Controller
    {
        private readonly IGenericRepository<Global_metric> _globalRepo;
        public GlobalMetricController(IGenericRepository<Global_metric> globalRepo)
        {
            _globalRepo = globalRepo;
        }

        [HttpGet("global-metric")]
        public async Task<IActionResult> GetGlobalMetric()
        {
            var results = await _globalRepo.GetAllAsync(); 
            return Ok(results);
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetGlobalMetricHistory(
            [FromQuery] string timeframe = "7d",
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
        {
            var now = DateTime.UtcNow;
            var fromDate = from ?? timeframe switch
            {
                "1d" => now.AddDays(-1),
                "7d" => now.AddDays(-7),
                "1m" => now.AddMonths(-1),
                "3m" => now.AddMonths(-3),
                "1y" => now.AddYears(-1),
                "all" => DateTime.MinValue,
                _ => now.AddDays(-7)
            };
            var toDate = to ?? now;

            var query = await _globalRepo.GetAllAsync();
            var results = query
                .Where(m => m.TimestampUtc >= fromDate && m.TimestampUtc <= toDate)
                .OrderBy(m => m.TimestampUtc)
                .ToList();

            return Ok(results);
        }

    }
}
