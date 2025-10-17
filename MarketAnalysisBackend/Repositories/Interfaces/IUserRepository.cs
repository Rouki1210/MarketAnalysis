using MarketAnalysisBackend.Models;

namespace MarketAnalysisBackend.Repositories.Interfaces
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByEmailOrUsernameAsync(string emailOrUsername);
        Task<User?> GetByWalletAddressAsync(string walletAddress);
        Task CreateAsync(User user);
        Task DeleteAllAsync();

    }
}
