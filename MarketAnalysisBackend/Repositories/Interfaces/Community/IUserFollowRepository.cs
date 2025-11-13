using MarketAnalysisBackend.Models.Community;

namespace MarketAnalysisBackend.Repositories.Interfaces.Community
{
    public interface IUserFollowRepository
    {
        Task<UserFollow?> GetByIdAsync(int id);
        Task<UserFollow?> GetFollowRelationshipAsync(int followerId, int followingId);
        Task<List<UserFollow>> GetFollowersAsync(int userId, int page = 1, int pageSize = 20);
        Task<List<UserFollow>> GetFollowingAsync(int userId, int page = 1, int pageSize = 20);
        Task<int> GetFollowersCountAsync(int userId);
        Task<int> GetFollowingCountAsync(int userId);
        Task<UserFollow> FollowUserAsync(int followerId, int followingId);
        Task<bool> UnfollowUserAsync(int followerId, int followingId);
        Task<bool> IsFollowingAsync(int followerId, int followingId);
    }
}
