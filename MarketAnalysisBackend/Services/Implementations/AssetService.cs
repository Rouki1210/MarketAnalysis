using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Implementations;

namespace MarketAnalysisBackend.Services.Interfaces
{
    public class AssetService : IAssetService
    {
        private readonly IGenericRepository<Asset> _assetService;
        public AssetService(IGenericRepository<Asset> assetService)
        {
            _assetService = assetService;
        }
        public async Task AddAssetAsync(Asset asset)
        {
            await _assetService.AddAsync(asset);
            await _assetService.SaveChangesAsync();
        }

        public async Task<IEnumerable<Asset>> GetAllAssetsAsync()
        {
            return await _assetService.GetAllAsync();
        }
    }
}
