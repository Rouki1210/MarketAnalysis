using System.Security.Cryptography;
using MarketAnalysisBackend.Services.Interfaces;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class AuthService : IAuthService
    {
        public string HashPassword(string plainPassword, int workFactor = 10)
        {
            return BCrypt.Net.BCrypt.HashPassword(plainPassword, workFactor);
        }

        public bool VerifyPassword(string plainPassword, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(hashedPassword, plainPassword);
        }

        public string GenerateRandomUsername(string prefix = "user")
        {
            byte[] bytes = RandomNumberGenerator.GetBytes(4);
            string hex = BitConverter.ToString(bytes).Replace("-", "").ToLower();
            return $"{prefix}_{hex}";
        }
    }
}
