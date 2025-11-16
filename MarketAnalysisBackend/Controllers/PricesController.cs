using MarketAnalysisBackend.Services.Implementations;
using Microsoft.AspNetCore.Mvc;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PricesController : ControllerBase
    {
        private readonly IPriceService _priceService;

        public PricesController(IPriceService priceService)
        {
            _priceService = priceService;
        }

        [HttpGet("{symbol}")]
        public async Task<IActionResult> GetPrices(string symbol, DateTime? from = null, DateTime? to = null)
        {
            var prices = await _priceService.GetPricePointsAsync(symbol, from, to);
            return Ok(prices);
        }

        [HttpGet("ohlc/{symbol}")]
        public async Task<IActionResult> GetOhlc(string symbol, string timeframe, DateTime? from = null, DateTime? to = null)
        {
            var prices = await _priceService.GetOhlcDtos(symbol, timeframe, from, to);
            return Ok(prices);
        }

        [HttpGet("sparkline/{symbol}")]
        public async Task<IActionResult> GetSparkline(string symbol, [FromQuery] int days = 7)
        {
            var to = DateTime.UtcNow;
            var from = to.AddDays(-days);
            var prices = await _priceService.GetPricePointsAsync(symbol, from, to);
            
            // Return simplified data for sparkline (only price and timestamp)
            var sparklineData = prices.Select(p => new 
            {
                timestamp = p.TimestampUtc,
                price = p.Price
            });
            
            return Ok(sparklineData);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPrice()
        {
            var prices = await _priceService.GetAllPriceAsync();
            return Ok(prices);
        }

        [HttpDelete]
        public async Task DeleteAllPrice()
        {
            await _priceService.DeleteAllAsync();
        }
    }
}
