using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using static MarketAnalysisBackend.Services.Implementations.WatchlistPriceMonitorService;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/watchlist/auto-alerts")]
    [Authorize]
    public class WatchlistautoAlertController : ControllerBase
    {
        private readonly ILogger<WatchlistautoAlertController> _logger;
        private readonly IUserAlertHistoryRepository _historyRepository;
        public WatchlistautoAlertController(ILogger<WatchlistautoAlertController> logger, IUserAlertHistoryRepository historyRepository)
        {
            _logger = logger;
            _historyRepository = historyRepository;
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        [HttpGet]
        public async Task<IActionResult> GetAutoAlerts([FromQuery] int limit = 50)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User ID not found in token.");
                }

                var alerts = await _historyRepository.GetAllAsync();

                var results = alerts
                    .OrderByDescending(h => h.TriggeredAt)
                    .Take(limit)
                    .Select(h => new AutoAlertDto
                    {
                        Id = h.Id,
                        AssetSymbol = h.AssetSymbol,
                        AssetName = h.Asset?.Name ?? "",
                        TargetPrice = h.TargetPrice,
                        ActualPrice = h.ActualPrice,
                        PriceDifference = h.PriceDifference,
                        TriggeredAt = h.TriggeredAt,
                        WasViewed = h.WasNotified,
                        ViewedAt = h.ViewAt
                    })
                    .ToList();

                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting auto alerts");
                return StatusCode(500, new { message = "Failed to retrieve auto alerts" });
            }
        }

        [HttpGet("by-asset/{assetId}")]
        [ProducesResponseType(typeof(List<AutoAlertDto>), 200)]
        public async Task<IActionResult> GetAlertsByAsset(int assetId, [FromQuery] int limit = 20)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return Unauthorized(new { message = "Invalid user" });
                }

                var alerts = await _historyRepository.GetAllAsync();

                var results = alerts
                    .OrderByDescending(h => h.TriggeredAt)
                    .Take(limit)
                    .Select(h => new AutoAlertDto
                    {
                        Id = h.Id,
                        AssetSymbol = h.AssetSymbol,
                        AssetName = h.Asset?.Name ?? "",
                        TargetPrice = h.TargetPrice,
                        ActualPrice = h.ActualPrice,
                        TriggeredAt = h.TriggeredAt,
                        WasViewed = h.WasNotified,
                    })
                    .ToList();

                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting alerts by asset");
                return StatusCode(500, new { message = "Failed to retrieve alerts" });
            }
        }
    }

    public class AutoAlertDto
    {
        public int Id { get; set; }
        public string AssetSymbol { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public decimal TargetPrice { get; set; }
        public decimal ActualPrice { get; set; }
        public decimal? PriceDifference { get; set; }
        public DateTime TriggeredAt { get; set; }
        public bool WasViewed { get; set; }
        public DateTime? ViewedAt { get; set; }
    }
}
