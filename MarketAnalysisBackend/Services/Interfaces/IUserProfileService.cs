using MarketAnalysisBackend.Models.DTO;

namespace MarketAnalysisBackend.Services.Interfaces
{
    public interface IUserProfileService
    {
        Task<UserDTO> GetProfileAsync(int userId);
        Task<UserDTO> UpdateProfileAsync(int userId, UpdateProfileDTO dto);
        Task<IEnumerable<UserSearchDTO>> SearchUsersAsync(string query, int limit = 10);
        Task<bool> IsUsernameAvailableAsync(string username);
        Task<bool> IsDisplayNameAvailableAsync(string displayName);

    }
}
