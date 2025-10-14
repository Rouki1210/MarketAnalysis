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
            var username = string.IsNullOrEmpty(dto.Username) ? GenerateRandomUsername() : dto.Username;
            var newUser = new User
            {
                Email = dto.Email,
                Username = username,
                PasswordHash = hashedPassword,
                CreatedAt = DateTime.UtcNow
            };
            await _userRepo.CreateAsync(newUser);
            return newUser;
        }

        private string GenerateRandomUsername()
        {
            const string chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            var randomPart = new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[random.Next(s.Length)]).ToArray());

            // ví dụ: sep = tháng 9 (September)
            string month = DateTime.UtcNow.ToString("MMM").ToLower();
            string day = DateTime.UtcNow.Day.ToString();

            return $"{randomPart}{month}{day}";
        }

        public async Task<User?> GoogleLoginAsync(string email, string name)
        {
            var user = await _userRepo.GetByEmailOrUsernameAsync(email);
            if (user != null) return user;

            var newUser = new User
            {
                Email = email,
                Username = $"google_{Guid.NewGuid().ToString().Substring(0, 6)}",
                CreatedAt = DateTime.UtcNow
            };
            await _userRepo.CreateAsync(newUser);
            return newUser;
        }

        public async Task DeleteAllUsersAsync()
        {
            await _userRepo.DeleteAllAsync();
        }

    }
}
