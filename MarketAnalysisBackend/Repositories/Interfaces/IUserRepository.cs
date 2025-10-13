using MarketAnalysisBackend.Models;

namespace MarketAnalysisBackend.Repositories.Interfaces
{
    public interface IUserRepository
    {
        User? GetByUsername(string username);
        User? GetByEmail(string email);
        void Add(User user);
    }
}
