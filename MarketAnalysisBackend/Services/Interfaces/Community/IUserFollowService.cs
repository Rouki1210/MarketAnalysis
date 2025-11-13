using MarketAnalysisBackend.Models.DTO;

namespace MarketAnalysisBackend.Services.Interfaces.Community
{
    public interface IUserFollowService
    {
        Task<bool> FollowUserAsync(int followerId, int followingId);
        Task<bool> UnfollowUserAsync(int followerId, int followingId);
        Task<bool> IsFollowingAsync(int followerId, int followingId);
        Task<List<UserFollowDto>> GetFollowersAsync(int userId, int page = 1, int pageSize = 20);
        Task<List<UserFollowDto>> GetFollowingAsync(int userId, int page = 1, int pageSize = 20);
        Task<FollowStatsDto> GetFollowStatsAsync(int userId);
    }
}
