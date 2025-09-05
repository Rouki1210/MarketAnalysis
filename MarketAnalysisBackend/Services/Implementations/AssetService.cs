using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Implementations;

namespace MarketAnalysisBackend.Services.Interfaces
{
    public class AssetService : IAssetService
    {
        private readonly IGenericRepository<Asset> _assetService;
        private readonly IAssetRepository _assetRepo;
        public AssetService(IGenericRepository<Asset> assetService, IAssetRepository asset)
        {
            _assetService = assetService;
            _assetRepo = asset;
        }
        public async Task AddAssetAsync(Asset asset)
        {
            await _assetService.AddAsync(asset);
            await _assetService.SaveChangesAsync();
        }

        public async Task DeleteAllAsync()
        {
            await _assetRepo.DeleteAllAsync();
        }

        public async Task<IEnumerable<Asset>> GetAllAssetsAsync()
        {
            return await _assetService.GetAllAsync();
        }
    }
}
