using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;

namespace MarketAnalysisBackend.Services.Interfaces
{
    public interface IAuthService
    {
        Task<User> RegisterAsync(RegisterDTO dto);
        Task<User?> LoginAsync(LoginDTO dto);
    }
}
