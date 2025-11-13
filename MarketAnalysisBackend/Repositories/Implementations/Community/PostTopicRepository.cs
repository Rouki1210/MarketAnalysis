using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models.Community;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations.Community
{
    public interface IPostTopicRepository
    {
        Task<List<PostTopic>> GetPostTopicAsync(int postId);
        Task<PostTopic> AddTopicToPostAsync(int postId, int topicId);
        Task<bool> RemoveTopicFromPostAsync(int postId, int topicId);
        Task<bool> RemoveAllTopicsFromPostAsync(int postId);
    }
    public class PostTopicRepository : IPostTopicRepository
    {
        private readonly AppDbContext _context;
        public PostTopicRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<PostTopic> AddTopicToPostAsync(int postId, int topicId)
        {
            var existing = await _context.PostTopics
                .FirstOrDefaultAsync(pt => pt.PostId == postId && pt.TopicId == topicId);
            if (existing != null)
                return existing;

            var postTopic = new PostTopic
            {
                PostId = postId,
                TopicId = topicId,
                CreatedAt = DateTime.UtcNow
            };

            await _context.PostTopics.AddAsync(postTopic);
            await _context.SaveChangesAsync();

            return postTopic;
        }

        public async Task<List<PostTopic>> GetPostTopicAsync(int postId)
        {
            return await _context.PostTopics
                .Include(p => p.Topic)
                .Where(p => p.PostId == postId)
                .ToListAsync();
        }

        public async Task<bool> RemoveAllTopicsFromPostAsync(int postId)
        {
            var postTopics = await _context.PostTopics
                .Where(pt => pt.PostId == postId)
                .ToListAsync();

            if (!postTopics.Any())
                return false;

            _context.PostTopics.RemoveRange(postTopics);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RemoveTopicFromPostAsync(int postId, int topicId)
        {
            var postTopic = await _context.PostTopics
                .FirstOrDefaultAsync(pt => pt.PostId == postId && pt.TopicId == topicId);

            if (postTopic == null)
                return false;

            _context.PostTopics.Remove(postTopic);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
