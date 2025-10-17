using MarketAnalysisBackend.Models;

namespace MarketAnalysisBackend.Repositories.Interfaces
{
    public interface INonceRepository : IGenericRepository<Nonce>
    {
        Task<Nonce?> GetByWalletAndNonceAsync(string walletAddress, string nonce);
        Task CreateAsync(Nonce nonce);
        Task DeleteExpiredAsync();
    }
}
