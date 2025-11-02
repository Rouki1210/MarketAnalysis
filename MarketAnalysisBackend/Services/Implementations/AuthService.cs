using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Interfaces;
using System.Security.Cryptography;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IWalletService _walletService;
        private readonly ILogger<AuthService> _logger;
        private readonly INonceRepository _nonceRepo;
        public AuthService(
            IUserRepository userRepo,
            IWalletService walletService,
            INonceRepository nonceRepo,
            IJwtService _jwt,
            ILogger<AuthService> logger)
        {
            _userRepo = userRepo;
            _walletService = walletService;
            _nonceRepo = nonceRepo;
            _logger = logger;
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
                DisplayName = username,
                PasswordHash = hashedPassword,
                Brithday = DateTime.MinValue,
                CreatedAt = DateTime.UtcNow,
                AuthProvider = "Local"
            };
            await _userRepo.CreateAsync(newUser);
            return newUser;
        }
        public async Task<bool> ChangePasswordAsync(string username, ChangePasswordDto dto)
        {
            var user = await _userRepo.GetByEmailOrUsernameAsync(username);
            if (user == null)
                throw new Exception("User not found");
            bool verify = BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash);
            if (!verify)
            {
                throw new Exception("Current password is incorrect");
            }
            string newHashPassword = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.PasswordHash = newHashPassword;

            await _userRepo.UpdateAsync(user);
            return true;

        }
        public async Task<User?> GoogleLoginAsync(string email, string name)
        {
            var user = await _userRepo.GetByEmailOrUsernameAsync(email);
            if (user != null) return user;

            var newUser = new User
            {
                Email = email,
                Username = $"google_{Guid.NewGuid().ToString().Substring(0, 6)}",
                CreatedAt = DateTime.UtcNow,
                AuthProvider = "Google"
            };
            await _userRepo.CreateAsync(newUser);
            return newUser;
        }

        public async Task<NonceResponseDTO> RequestNonceAsync(string walletAddress)
        {
            if (!_walletService.IsValidWalletAddress(walletAddress))
                throw new ArgumentException("Invalid Ethereum address");

            var nonce = Guid.NewGuid().ToString();
            var message = _walletService.GenerateNonceMessage(walletAddress, nonce);

            var nonceEntity = new Nonce
            {
                WalletAddress = walletAddress.ToLower(),
                NonceValue = nonce,
                CreateAt = DateTime.UtcNow,
                ExpireAt = DateTime.UtcNow.AddMinutes(10),
                IsUsed = false
            };

            await _nonceRepo.CreateAsync(nonceEntity);

            return new NonceResponseDTO
            {
                Nonce = nonce,
                Message = message,
                ExpiresAt = nonceEntity.ExpireAt
            };
        }

        public async Task<User> MetaMaskLoginAsync(MetaMaskLoginDTO dto)
        {
            if (!_walletService.IsValidWalletAddress(dto.WalletAddress))
            {
                throw new ArgumentException("Invalid wallet address format");
            }
            var nonceFromMessage = ExtractNonceFromMessage(dto.Message);
            if (string.IsNullOrEmpty(nonceFromMessage))
                throw new ArgumentException("Invalid message format");

            var nonce = await _nonceRepo.GetByWalletAndNonceAsync(dto.WalletAddress, nonceFromMessage);

            if (nonce == null)
                throw new InvalidOperationException("Nonce not found. Request a new nonce first.");

            if (nonce.IsUsed)
                throw new InvalidOperationException("Nonce already used");

            if (nonce.ExpireAt < DateTime.UtcNow)
                throw new InvalidOperationException("Nonce expired. Request a new nonce.");

            var isValidSignature = await _walletService.VerifySignatureAsync(dto.Message, dto.Signature, dto.WalletAddress);

            if (!isValidSignature)
                throw new UnauthorizedAccessException("Invalid signature");

            nonce.IsUsed = true;
            await _nonceRepo.UpdateAsync(nonce);

            var user = await _userRepo.GetByWalletAddressAsync(dto.WalletAddress);

            if (user == null)
            {
                user = new User
                {
                    WalletAddress = dto.WalletAddress.ToLower(),
                    Username = GenerateWalletUsername(),
                    Email = $"wallet_{Guid.NewGuid().ToString().Substring(0, 8)}@metamask.local",
                    CreatedAt = DateTime.UtcNow,
                    AuthProvider = "MetaMask"
                };
                await _userRepo.CreateAsync(user);
                _logger.LogInformation($"Created new user for wallet {dto.WalletAddress}");
            }

            return user;
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

        private string GenerateWalletUsername()
        {
            return $"wallet_{Guid.NewGuid().ToString().Substring(0, 8)}";
        }

        private string? ExtractNonceFromMessage(string message)
        {
            try
            {
                var lines = message.Split('\n');
                var nonceLine = lines.FirstOrDefault(l => l.StartsWith("Nonce:"));
                if (string.IsNullOrEmpty(nonceLine))
                    return null;

                return nonceLine.Replace("Nonce:", "").Trim();
            }
            catch
            {
                return null;
            }
        }
    }   
}
