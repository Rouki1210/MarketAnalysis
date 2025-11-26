using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Implementations;

namespace MarketAnalysisBackend.Services.Interfaces
{
    public class AssetService : IAssetService
    {
        private readonly IGenericRepository<Asset> _assetService;
        private readonly IAssetRepository _assetRepo;
        private readonly IAssetImport _assetImporter;

        public AssetService(
            IGenericRepository<Asset> assetService,
            IAssetRepository asset,
            IAssetImport assetImporter
        )
        {
            _assetService = assetService;
            _assetRepo = asset;
            _assetImporter = assetImporter;
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

        public async Task<IEnumerable<Asset>> GetByPagination(int pageNumber, int pageSize)
        {
            return await _assetRepo.GetByPagination(pageNumber, pageSize);
        }

        public async Task<Asset?> GetAssetBySymbolAsync(string symbol)
        {
            var assets = await _assetService.GetAllAsync();
            return assets.FirstOrDefault(a => a.Symbol.Equals(symbol, StringComparison.OrdinalIgnoreCase));
        }

        public async Task<IEnumerable<Asset>> RefreshTopAssetAsync(CancellationToken cancellationToken = default)
        {
            await _assetRepo.DeleteAllAsync();
            await _assetService.SaveChangesAsync();
            return await _assetImporter.ImportAssetByRank(1, 10, true, cancellationToken); // Use the instance
        }

        public async Task<IEnumerable<Asset>> GetAllAssetsByRankAsync()
        {
            return await _assetRepo.GetByRank();
        }
    }
}
