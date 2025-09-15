using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Services.Implementations;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssetController : ControllerBase
    {
        private readonly IAssetService _assetService;
        private readonly IAssetImport _assetImport;

        public AssetController(IAssetService assetService, IAssetImport assetImport)
        {
            _assetService = assetService;
            _assetImport = assetImport;
        }

        [HttpGet]
        public async Task<IActionResult> GetAssets()
        {
            var assets = await _assetService.GetAllAssetsAsync();
            return Ok(assets);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsset(Asset asset)
        {
            await _assetService.AddAssetAsync(asset);
            return Ok(asset);
        }

        [HttpDelete]
        public async Task DeleteAsset()
        {
            await _assetService.DeleteAllAsync();
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportAssets()
        {
            await _assetImport.ImportAssetsAsync();
            return Ok();
        }

        [HttpPost("importbyrank")]
        public async Task<IActionResult> ImportAssetsByRank(
            int fromRank,
            int toRank,
            [FromQuery] bool updateExisting)
        {
            var assets = await _assetImport.ImportAssetByRank(fromRank, toRank, updateExisting);
            return Ok(assets);
        }

        [HttpGet("rank")]
        public async Task<IActionResult> GetByRankRange(int from, int to)
        {
            var assets = await _assetImport.GetByRankRangeAsync(from, to);
            return Ok(assets);
        }

        [HttpPost("refreshTop")]
        public async Task<IActionResult> RefreshTopAsset(CancellationToken cancellationToken = default)
        {
            var assets = await _assetService.RefreshTopAssetAsync(cancellationToken);
            return Ok(new
            {
                Message = "Top asset refreshed successfully",
                count = assets.Count(),
                Assets = assets
            });
        }
    }
}
