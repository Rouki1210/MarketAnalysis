using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models.Community;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations.Community
{
    public interface ITopicFollowRepository
    {
        Task<TopicFollow?> GetByIdAsync(int id);
        Task<TopicFollow?> GetUserTopicFollowAsync(int topicId, int userId);
        Task<List<TopicFollow>> GetUserFollowedTopicsAsync(int userId);
        Task<int> GetTopicFollowerCountAsync(int topicId);
        Task<TopicFollow> FollowTopicAsync(int topicId, int userId);
        Task<bool> UnfollowTopicAsync(int topicId, int userId);
        Task<bool> IsFollowingTopicAsync(int topicId, int userId);
    }
    public class TopicFollowRepository : ITopicFollowRepository
    {
        private readonly AppDbContext _context;
        public TopicFollowRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<TopicFollow> FollowTopicAsync(int topicId, int userId)
        {
            var existing = await GetUserTopicFollowAsync(topicId, userId);
            if (existing != null)
                return existing;

            var topicFollow = new TopicFollow
            {
                TopicId = topicId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            await _context.TopicFollows.AddAsync(topicFollow);
            await _context.SaveChangesAsync();

            // Update topic follower count
            var topic = await _context.Topics.FindAsync(topicId);
            if (topic != null)
            {
                topic.FollowerCount = await GetTopicFollowerCountAsync(topicId);
                await _context.SaveChangesAsync();
            }

            return topicFollow;
        }

        public async Task<TopicFollow?> GetByIdAsync(int id)
        {
            return await _context.TopicFollows.FindAsync(id);
        }

        public async Task<int> GetTopicFollowerCountAsync(int topicId)
        {
            return await _context.TopicFollows.CountAsync(tf => tf.TopicId == topicId);
        }

        public async Task<List<TopicFollow>> GetUserFollowedTopicsAsync(int userId)
        {
            return await _context.TopicFollows
                .Include(tf => tf.Topic)
                .Where(tf => tf.UserId == userId)
                .OrderByDescending(tf => tf.CreatedAt)
                .ToListAsync();
        }

        public async Task<TopicFollow?> GetUserTopicFollowAsync(int topicId, int userId)
        {
            return await _context.TopicFollows
                .FirstOrDefaultAsync(tf => tf.TopicId == topicId && tf.UserId == userId);
        }

        public async Task<bool> IsFollowingTopicAsync(int topicId, int userId)
        {
            return await _context.TopicFollows
                .AnyAsync(tf => tf.TopicId == topicId && tf.UserId == userId);
        }

        public async Task<bool> UnfollowTopicAsync(int topicId, int userId)
        {
            var topicFollow = await GetUserTopicFollowAsync(topicId, userId);
            if (topicFollow == null)
                return false;

            _context.TopicFollows.Remove(topicFollow);
            await _context.SaveChangesAsync();

            // Update topic follower count
            var topic = await _context.Topics.FindAsync(topicId);
            if (topic != null)
            {
                topic.FollowerCount = await GetTopicFollowerCountAsync(topicId);
                await _context.SaveChangesAsync();
            }

            return true;
        }
    }
}
