using MarketAnalysisBackend.Models;

namespace MarketAnalysisBackend.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailOrUsernameAsync(string emailOrUsername);
        Task CreateAsync(User user);
    }
}
