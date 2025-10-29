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

    }
}
