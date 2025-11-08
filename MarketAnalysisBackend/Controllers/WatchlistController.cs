using MarketAnalysisBackend.Services.Implementations;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WatchlistController : Controller
    {
        private readonly IWatchlistService _watchlistSer;
        public WatchlistController(IWatchlistService watchlistSer)
        {
            _watchlistSer = watchlistSer;
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetWatchlistsByUserId(int userId)
        {
            var watchlists = await _watchlistSer.GetWatchlistsByUserIdAsync(userId);
            return Ok(watchlists);
        }

        [HttpPost("{userId}/create")]
        public async Task<IActionResult> CreateWatchlist(int userId, string name)
        {
            try
            {
                var watchlist = await _watchlistSer.CreateWatchlistAsync(userId, name);
                return Ok(new { success = true, data = watchlist });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpPost("{userId}/watchlist-defaut")]
        public async Task<IActionResult> CreateDefaultWatchlist(int userId, int assetId)
        {
            try
            {
                var watchlist = await _watchlistSer.CreateWatchlistDefaultAsync(userId, assetId);
                return Ok(new { success = true, data = watchlist });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpPost("{watchlistId}/add/{assetId}")]
        public async Task<IActionResult> AddAssetToWatchlist(int watchlistId, int assetId)
        {
            try
            {
                await _watchlistSer.AddAssetToWatchlistAsync(watchlistId, assetId);
                return Ok(new { success = true });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet("{watchlistId}")]
        public async Task<IActionResult> GetWatchlistById(int watchlistId)
        {
            var watchlist = await _watchlistSer.GetWatchlistByIdAsync(watchlistId);
            if (watchlist == null)
                return NotFound(new { success = false, error = "Watchlist not found." });
            return Ok(new { success = true, data = watchlist });
        }

        [HttpDelete("{watchlistId}/remove/{assetId}")]
        public async Task<IActionResult> RemoveAssetFromWatchlist(int watchlistId, int assetId)
        {
            try
            {
                await _watchlistSer.RemoveAssetFromWatchlistAsync(watchlistId, assetId);
                return Ok(new { success = true });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        /// <summary>
        /// Get or create default watchlist for user
        /// </summary>
        [HttpGet("user/{userId}/default")]
        public async Task<IActionResult> GetOrCreateDefaultWatchlist(int userId)
        {
            try
            {
                var watchlist = await _watchlistSer.GetOrCreateDefaultWatchlistAsync(userId);
                return Ok(new { success = true, data = watchlist });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        /// <summary>
        /// Toggle asset in default watchlist (add if not exists, remove if exists)
        /// </summary>
        [HttpPost("user/{userId}/toggle/{assetId}")]
        public async Task<IActionResult> ToggleAssetInDefaultWatchlist(int userId, int assetId)
        {
            try
            {
                var result = await _watchlistSer.ToggleAssetInDefaultWatchlistAsync(userId, assetId);
                return Ok(new { success = true, added = result.Added, watchlist = result.Watchlist });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        }
    }
