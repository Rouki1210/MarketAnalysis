using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Interfaces;
using System.Security.Cryptography;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepo;
        public AuthService( IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }
        public async Task<User?> LoginAsync(LoginDTO dto)
        {
            var user = await _userRepo.GetByEmailOrUsernameAsync(dto.UsernameOrEmail);
            if (user == null) return null;

            bool isValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            return isValid ? user : null;
        }

        public async Task<User> RegisterAsync(RegisterDTO dto)
        {
            var existingUser = await _userRepo.GetByEmailOrUsernameAsync(dto.Email);
            if (existingUser != null)
                throw new Exception("Email or username already in use.");

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            var newUser = new User
            {
                Email = dto.Email,
                Username = string.IsNullOrEmpty(dto.Username)
                            ? $"user_{Guid.NewGuid().ToString().Substring(0, 6)}"
                            : dto.Username,
                PasswordHash = hashedPassword,
                CreatedAt = DateTime.UtcNow
            };
            await _userRepo.CreateAsync(newUser);
            return newUser;
        }
    }
}
