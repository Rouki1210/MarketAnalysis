using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Services.Implementations;
using Microsoft.AspNetCore.Mvc;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssetController : ControllerBase
    {
        private readonly IAssetService _assetService;

        public AssetController(IAssetService assetService)
        {
            _assetService = assetService;
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

    }
}
