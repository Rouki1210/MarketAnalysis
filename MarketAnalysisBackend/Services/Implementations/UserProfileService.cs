using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Interfaces;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class UserProfileService : IUserProfileService
    {
        private readonly ILogger<UserProfileService> _logger;
        private readonly IUserRepository _userRepo;
        public UserProfileService(ILogger<UserProfileService> logger, IUserRepository userRepo)
        {
            _logger = logger;
            _userRepo = userRepo;
        }
        public async Task<UserDTO> GetProfileAsync(int userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found.");
            }
            return MapToDTO(user);
        }

        public async Task<bool> IsDisplayNameAvailableAsync(string displayName)
        {
            return true;
        }

        public async Task<bool> IsUsernameAvailableAsync(string username)
        {
            var user = await  _userRepo.GetByEmailOrUsernameAsync(username);
            return user == null;
        }

        public Task<IEnumerable<UserSearchDTO>> SearchUsersAsync(string query, int limit = 10)
        {
            var users =  _userRepo.SearchByDisplayNameOrUsernameAsync(query, limit);
            return Task.FromResult(users.Result.Select(u => new UserSearchDTO
            {
                Id = u.Id,
                Username = u.Username,
                DisplayName = u.DisplayName,
                Bio = u.Bio,
            }));
        }

        public async Task<UserDTO> UpdateProfileAsync(int userId, UpdateProfileDTO dto)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            if(!string.IsNullOrEmpty(dto.DisplayName))
            {
                if (dto.DisplayName.Length < 5 || dto.DisplayName.Length > 50)
                {
                    throw new Exception("Display name must be between 5 and 50 characters.");
                }
                user.DisplayName = dto.DisplayName;
            }

            if (dto.Bio != null)
            {
                if (dto.Bio.Length > 250)
                    throw new ArgumentException("Bio too long");
                user.Bio = dto.Bio.Trim();
            }

            if (dto.Website != null)
            {
                if (!Uri.TryCreate(dto.Website, UriKind.Absolute, out _))
                    throw new ArgumentException("Invalid website URL");
                user.Website = dto.Website;
            }

            if (dto.Birthday.HasValue)
            {
                if (dto.Birthday.Value > DateTime.UtcNow.AddYears(-13))
                    throw new ArgumentException("User must be at least 13 years old");
                user.Brithday = dto.Birthday.Value;
            }

            user.UpdatedAt = DateTime.UtcNow;
            await _userRepo.UpdateAsync(user);

            _logger.LogInformation("Profile updated for user {UserId}", userId);
            return MapToDTO(user);
        }

        private UserDTO MapToDTO(User user)
        {
            return new UserDTO
            {
                Id = user.Id,
                Username = user.Username,
                DisplayName = user.DisplayName,
                Email = user.Email,
                WalletAddress = user.WalletAddress,
                AuthType = user.AuthProvider,
                Bio = user.Bio,
                Website = user.Website
            };
        }
    }
}
