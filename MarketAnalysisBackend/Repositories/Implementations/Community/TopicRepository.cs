using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models.Community;
using MarketAnalysisBackend.Repositories.Interfaces.Community;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations.Community
{
    public class TopicRepository : ITopicRepository
    {
        private readonly AppDbContext _context;
        public TopicRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Topic> CreateAsync(Topic topic)
        {
            topic.CreatedAt = DateTime.UtcNow;
            topic.Slug = GenerateSlug(topic.Name);

            await _context.Topics.AddAsync(topic);
            await _context.SaveChangesAsync();

            return topic;
        }

        public async Task<bool> DecrementPostCountAsync(int topicId)
        {
            var topic = await _context.Topics.FindAsync(topicId);
            if (topic == null)
            {
                return false;
            }

            if (topic.PostCount > 0)
            {
                topic.PostCount--;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var topic = await _context.Topics.FindAsync(id);
            if (topic == null)
            {
                return false;
            }

            _context.Topics.Remove(topic);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<Topic>> GetAllAsync()
        {
            return await _context.Topics
                .OrderBy(t => t.Name)
                .ToListAsync();
        }

        public async Task<Topic?> GetByIdAsync(int id)
        {
            return await _context.Topics
                .Include(t => t.PostTopics)
                .Include(t => t.TopicFollows)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<Topic?> GetBySlugAsync(string slug)
        {
            return await _context.Topics
                .Include(t => t.PostTopics)
                .Include(t => t.TopicFollows)
                .FirstOrDefaultAsync(t => t.Slug == slug);
        }

        public async Task<List<Topic>> GetPopularAsync(int limit = 10)
        {
            return await _context.Topics
                .OrderByDescending(t => t.FollowerCount)
                .ThenByDescending(t => t.PostCount)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<bool> IncrementPostCountAsync(int topicId)
        {
            var topic = await _context.Topics.FindAsync(topicId);
            if (topic == null)
                return false;

            topic.PostCount++;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<Topic> UpdateAsync(Topic topic)
        {
            _context.Topics.Update(topic);
            await _context.SaveChangesAsync();
            return topic;
        }

        private string GenerateSlug(string name)
        {
            return name.ToLower()
                .Replace(" ", "-")
                .Replace("&", "and")
                .Replace("'", "")
                .Replace("\"", "");
        }
    }
}
