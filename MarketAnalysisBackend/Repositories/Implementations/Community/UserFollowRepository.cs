using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models.Community;
using MarketAnalysisBackend.Repositories.Interfaces.Community;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations.Community
{
    public class UserFollowRepository : IUserFollowRepository
    {
        private readonly AppDbContext _context;
        public UserFollowRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<UserFollow> FollowUserAsync(int followerId, int followingId)
        {
            if (followerId == followingId)
            {
                throw new ArgumentException("A user cannot follow themselves.");
            }

            var existingFollow = await GetFollowRelationshipAsync(followerId, followingId);
            if (existingFollow != null)
                throw new InvalidOperationException("Already following this user.");

            var follow = new UserFollow
            {
                FollowerId = followerId,
                FollowingId = followingId,
                CreatedAt = DateTime.UtcNow
            };

            await _context.userFollows.AddAsync(follow);
            await _context.SaveChangesAsync();

            await UpdateFollowerCountsAsync(followingId, followerId);

            return follow;

        }

        public async Task<UserFollow?> GetByIdAsync(int id)
        {
            return await _context.userFollows.FindAsync(id);
        }

        public async Task<List<UserFollow>> GetFollowersAsync(int userId, int page = 1, int pageSize = 20)
        {
            return await _context.userFollows
                .Include(f => f.Follower)
                .Where(f => f.FollowingId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetFollowersCountAsync(int userId)
        {
            return await _context.userFollows.CountAsync(f => f.FollowingId == userId);
        }

        public async Task<List<UserFollow>> GetFollowingAsync(int userId, int page = 1, int pageSize = 20)
        {
            return await _context.userFollows
                .Include(f => f.Following)
                .Where(f => f.FollowerId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        private async Task UpdateFollowerCountsAsync(int followingId, int followerId)
        {
            var followingUser = await _context.Users.FindAsync(followingId);
            var followerUser = await _context.Users.FindAsync(followerId);

            if (followingUser != null)
            {
                followingUser.FollowerCount = await GetFollowersCountAsync(followingId);
            }

            if (followerUser != null)
            {
                followerUser.FollowingCount = await GetFollowingCountAsync(followerId);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<int> GetFollowingCountAsync(int userId)
        {
            return await _context.userFollows.CountAsync(f => f.FollowerId == userId);
        }

        public async Task<UserFollow?> GetFollowRelationshipAsync(int followerId, int followingId)
        {
            return await _context.userFollows
                .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);
        }

        public async Task<bool> IsFollowingAsync(int followerId, int followingId)
        {
            return await _context.userFollows.AnyAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);
        }

        public async Task<bool> UnfollowUserAsync(int followerId, int followingId)
        {
            var follow = await GetFollowRelationshipAsync(followerId, followingId);
            if (follow == null)
                return false;

            _context.userFollows.Remove(follow);
            await _context.SaveChangesAsync();

            // Update follower counts
            await UpdateFollowerCountsAsync(followingId, followerId);

            return true;
        }
    }
}
