using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Interfaces.Community;
using MarketAnalysisBackend.Services.Interfaces;
using MarketAnalysisBackend.Services.Interfaces.Community;

namespace MarketAnalysisBackend.Services.Implementations.Community
{
    public class UserFollowService : IUserFollowService
    {
        private readonly IUserFollowRepository _userFollowRepository;
        private readonly ICommunityNotificationService _notificationService;
        public UserFollowService(IUserFollowRepository userFollowRepository, ICommunityNotificationService notificationService)
        {
            _userFollowRepository = userFollowRepository;
            _notificationService = notificationService;
        }
        public async Task<bool> FollowUserAsync(int followerId, int followingId)
        {
            if(followerId == followingId)
                throw new ArgumentException("You cannot follow yourself");

            var isAlreadyFollowing = await _userFollowRepository.IsFollowingAsync(followerId, followingId);
            if (isAlreadyFollowing)
                return false;

            await _userFollowRepository.IsFollowingAsync(followerId, followingId);
            await _notificationService.NotifyUserAsync(
                followingId,
                followerId,
                "follow",
                "user",
                followerId,
                "started following you"
            );

            return true;
        }

        public async Task<List<UserFollowDto>> GetFollowersAsync(int userId, int page = 1, int pageSize = 20)
        {
            var followers = await _userFollowRepository.GetFollowersAsync(userId, page, pageSize);
            return followers.Select(f => new UserFollowDto
            {
                Id = f.Id,
                User = new UserBasicDto
                {
                    Id = f.Follower?.Id ?? 0,
                    Username = f.Follower?.Username ?? "",
                    DisplayName = f.Follower?.DisplayName ?? "",
                    AvatarEmoji = f.Follower?.AvartarUrl,
                    IsVerified = f.Follower?.IsVerified ?? false
                },
                FollowedAt = f.CreatedAt
            }).ToList();
        }

        public async Task<List<UserFollowDto>> GetFollowingAsync(int userId, int page = 1, int pageSize = 20)
        {
            var following = await _userFollowRepository.GetFollowingAsync(userId, page, pageSize);

            return following.Select(f => new UserFollowDto
            {
                Id = f.Id,
                User = new UserBasicDto
                {
                    Id = f.Following?.Id ?? 0,
                    Username = f.Following?.Username ?? "",
                    DisplayName = f.Following?.DisplayName ?? "",
                    AvatarEmoji = f.Following?.AvartarUrl,
                    IsVerified = f.Following?.IsVerified ?? false
                },
                FollowedAt = f.CreatedAt
            }).ToList();
        }

        public async Task<FollowStatsDto> GetFollowStatsAsync(int userId)
        {
            var followersCount = await _userFollowRepository.GetFollowingCountAsync(userId);
            var followingCount = await _userFollowRepository.GetFollowingCountAsync(userId);

            return new FollowStatsDto
            {
                FollowersCount = followersCount,
                FollowingCount = followingCount
            };
        }

        public async Task<bool> IsFollowingAsync(int followerId, int followingId)
        {
            return await _userFollowRepository.IsFollowingAsync(followerId, followingId);
        }

        public async Task<bool> UnfollowUserAsync(int followerId, int followingId)
        {
            return await _userFollowRepository.UnfollowUserAsync(followerId, followingId);
        }
    }
}
