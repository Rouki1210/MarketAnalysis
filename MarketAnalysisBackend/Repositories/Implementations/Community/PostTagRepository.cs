using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models.Community;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations.Community
{
    public interface IPostTagRepository
    {
        Task<List<PostTag>> GetPostTagsAsync(int postId);
        Task<List<PostTag>> GetTagsByNameAsync(string tagName);
        Task<PostTag> AddTagToPostAsync(int postId, string tagName);
        Task<bool> RemoveTagFromPostAsync(int postId, string tagName);
        Task<bool> RemoveAllTagsFromPostAsync(int postId);
        Task<List<string>> GetPopularTagsAsync(int limit = 20);
    }
    public class PostTagRepository : IPostTagRepository
    {
        private readonly AppDbContext _context;
        public PostTagRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<PostTag> AddTagToPostAsync(int postId, string tagName)
        {
            var normalizedTag = tagName.Trim().ToLower();

            var existing = await _context.PostTags
                .FirstOrDefaultAsync(pt => pt.PostId == postId && pt.TagName.ToLower() == normalizedTag);

            if (existing != null)
                return existing;

            var tag = new PostTag
            {
                PostId = postId,
                TagName = normalizedTag,
                CreatedAt = DateTime.UtcNow
            };

            await _context.PostTags.AddAsync(tag);
            await _context.SaveChangesAsync();

            return tag;
        }

        public async Task<List<string>> GetPopularTagsAsync(int limit = 20)
        {
            return await _context.PostTags
                .GroupBy(pt => pt.TagName)
                .OrderByDescending(g => g.Count())
                .Take(limit)
                .Select(g => g.Key)
                .ToListAsync();
        }

        public async Task<List<PostTag>> GetPostTagsAsync(int postId)
        {
           return await _context.PostTags
                .Where(pt => pt.PostId == postId)
                .ToListAsync();
        }

        public async Task<List<PostTag>> GetTagsByNameAsync(string tagName)
        {
            return await _context.PostTags
                .Include(p => p.Post)
                    .ThenInclude(p => p.User)
                .Where(pt => pt.TagName.ToLower() == tagName.Trim().ToLower())
                .ToListAsync();
        }

        public async Task<bool> RemoveAllTagsFromPostAsync(int postId)
        {
            var tags = await _context.PostTags
                .Where(pt => pt.PostId == postId)
                .ToListAsync();

            if (!tags.Any())
                return false;

            _context.PostTags.RemoveRange(tags);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RemoveTagFromPostAsync(int postId, string tagName)
        {
            var normalizedTag = tagName.Trim().ToLower();

            var tag = await _context.PostTags
                .FirstOrDefaultAsync(pt => pt.PostId == postId && pt.TagName.ToLower() == normalizedTag);

            if (tag == null)
                return false;

            _context.PostTags.Remove(tag);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
