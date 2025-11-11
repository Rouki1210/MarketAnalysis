using MarketAnalysisBackend.Models.AI;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AIAnalysisController : Controller
    {
        private readonly ILogger<AIAnalysisController> _logger;
        private readonly IAiAnalysisService _aiService;

        public AIAnalysisController(ILogger<AIAnalysisController> logger, IAiAnalysisService aiService)
        {
            _logger = logger;
            _aiService = aiService;
        }
        [HttpGet("{symbol}")]
        [ProducesResponseType(typeof(CoinAnalysisReponse), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetAnalysis(string symbol, CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(symbol))
                {
                    return BadRequest(new { error = "Symbol is required" });
                }

                var analysis = await _aiService.AnalyzeCoinAsync(symbol, cancellationToken);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing coin {Symbol}", symbol);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }
    }
}
