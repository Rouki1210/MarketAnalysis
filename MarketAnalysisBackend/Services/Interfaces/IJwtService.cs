using MarketAnalysisBackend.Models;
using System.Security.Claims;

namespace MarketAnalysisBackend.Services.Interfaces
{
    public interface IJwtService
    {
        Task<string> GenerateToken(User user);
        ClaimsPrincipal? GetPrincipalFromToken(string token);
    }
}
