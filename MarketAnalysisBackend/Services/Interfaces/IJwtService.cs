using MarketAnalysisBackend.Models;

namespace MarketAnalysisBackend.Services.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
