using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;

namespace MarketAnalysisBackend.Services.Interfaces
{
    public interface IAuthService
    {
        Task<User> RegisterAsync(RegisterDTO dto);
        Task<User?> LoginAsync(LoginDTO dto);

        Task<User?> GoogleLoginAsync(string email, string username);

        Task<NonceResponseDTO> RequestNonceAsync(string walletAddress);
        Task<User?> MetaMaskLoginAsync(MetaMaskLoginDTO dto);
        Task<bool> ChangePasswordAsync(string username, ChangePasswordDto dto);
    }
}
