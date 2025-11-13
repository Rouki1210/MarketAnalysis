using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models.Community;
using MarketAnalysisBackend.Repositories.Interfaces.Community;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations.Community
{
    public class CommunityPostRepository : ICommunityPostRepository
    {
        private readonly AppDbContext _context;
        public CommunityPostRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<CommunityPost> CreateAsync(CommunityPost post)
        {
            post.CreatedAt = DateTime.UtcNow;
            post.UpdatedAt = DateTime.UtcNow;

            await _context.CommunityPosts.AddAsync(post);
            await _context.SaveChangesAsync();

            return post;
        }

        public async Task<bool> DeleteAsync(int id, bool softDelete = true)
        {
            var post = await _context.CommunityPosts
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Id == id);
            if (post == null)
                return false;

            if (softDelete)
            {
                post.DeletedAt = DateTime.UtcNow;
                _context.CommunityPosts.Update(post);
            }
            else
            {
                _context.CommunityPosts.Remove(post);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<CommunityPost>> GetAllAsync(int page = 1, int pageSize = 10, string sortBy = "CreatedAt", bool includeDeleted = false)
        {
            var query = _context.CommunityPosts
                .Include(p => p.User)
                .Include(p => p.Tags)
                .Include(p => p.Reactions)
                .Include(p => p.Comments)
                .Include(p => p.Bookmarks)
                .AsQueryable();

            if (includeDeleted)
            {
                query = query.IgnoreQueryFilters();
            }

            query = sortBy.ToLower() switch
            {
                "views" => query.OrderByDescending(p => p.ViewCount),
                "likes" => query.OrderByDescending(p => p.Reactions.Count),
                "comments" => query.OrderByDescending(p => p.Comments.Count),
                _ => query.OrderByDescending(p => p.CreatedAt)
            };

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<CommunityPost?> GetByIdAsync(int id, bool includeDeleted = false)
        {
            var query = _context.CommunityPosts.AsQueryable();
            if (includeDeleted)
            {
                query = query.IgnoreQueryFilters();
            }

            return await query.FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<CommunityPost?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.CommunityPosts
                .Include(p => p.User)
                .Include(p => p.Tags)
                .Include(p => p.Reactions)
                .Include(p => p.Comments)
                .Include(p => p.Bookmarks)
                .Include(p => p.Topics)
                    .ThenInclude(pt => pt.Topic)
                .FirstOrDefaultAsync(p => p.Id == id); 
        }

        public async Task<List<CommunityPost>> GetByTopicAsync(int topicId, int page = 1, int pageSize = 5)
        {
            return await _context.CommunityPosts
                .Include(p => p.User)
                .Include(p => p.Tags)
                .Include(p => p.Reactions)
                .Include(p => p.Topics)
                .Where(p => p.Topics.Any(pt => pt.TopicId == topicId))
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<List<CommunityPost>> GetByUserIdAsync(int userId, int page = 1, int pageSize = 10)
        {
            return await _context.CommunityPosts
                .Include(p => p.User)
                .Include(p => p.Tags)
                .Include(p => p.Reactions)
                .Include(p => p.Bookmarks)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _context.CommunityPosts.CountAsync();
        }

        public async Task<List<CommunityPost>> GetTrendingAsync(int hours = 24, int limit = 10)
        {
            var cutoffTime = DateTime.UtcNow.AddHours(-hours);

            return await _context.CommunityPosts
                .Include(p => p.User)
                .Include(p => p.Tags)
                .Include(p => p.Reactions)
                .Include(p => p.Comments)
                .Include(p => p.Bookmarks)
                .Where(p => p.CreatedAt >= cutoffTime && p.IsPublished)
                .OrderByDescending(p => p.Reactions.Count + p.Comments.Count + p.ViewCount / 10)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<int> IncrementViewCountAsync(int id)
        {
            var post = await _context.CommunityPosts.FindAsync(id);
            if (post == null)
                return 0;

            post.ViewCount++;
            await _context.SaveChangesAsync();

            return post.ViewCount;
        }

        public async Task<List<CommunityPost>> SearchAsync(string query, int page = 1, int pageSize = 5)
        {
            var searchQuery = query.ToLower();

            return await _context.CommunityPosts
                .Include(p => p.User)
                .Include(p => p.Tags)
                .Include(p => p.Reactions)
                .Where(p => p.Title.ToLower().Contains(searchQuery) ||
                           p.Content.ToLower().Contains(searchQuery) ||
                           p.Tags.Any(t => t.TagName.ToLower().Contains(searchQuery)))
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<bool> TogglePinAsync(int id)
        {
            var post = await _context.CommunityPosts.FindAsync(id);
            if (post == null)
                return false;

            post.IsPinned = !post.IsPinned;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<CommunityPost> UpdateAsync(CommunityPost post)
        {
            post.UpdatedAt = DateTime.UtcNow;

            _context.CommunityPosts.Update(post);
            await _context.SaveChangesAsync();

            return post;
        }
    }
}
