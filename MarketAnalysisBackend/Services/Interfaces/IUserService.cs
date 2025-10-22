using MarketAnalysisBackend.Models;

namespace MarketAnalysisBackend.Services.Interfaces
{
    public interface IUserService
    {
        Task<User?> GetUserByEmailorUsername(string? emailorusername);
    }
}
