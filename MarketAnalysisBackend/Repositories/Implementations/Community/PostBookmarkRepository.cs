using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models.Community;
using MarketAnalysisBackend.Repositories.Interfaces.Community;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations.Community
{
    public class PostBookmarkRepository : IPostBookmarkRepository
    {
        private readonly AppDbContext _context;
        public PostBookmarkRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<PostBookmark> AddBookmarkAsync(PostBookmark bookmark)
        {
            bookmark.CreatedAt = DateTime.UtcNow;

            await _context.Bookmarks.AddAsync(bookmark);
            await _context.SaveChangesAsync();

            return bookmark;
        }

        public async Task<int> GetBookmarkCountAsync(int postId)
        {
            return await _context.Bookmarks.CountAsync(b => b.PostId == postId);
        }

        public async Task<PostBookmark?> GetByIdAsync(int id)
        {
            return await _context.Bookmarks.FindAsync(id);
        }

        public async Task<PostBookmark?> GetUserBookmarkAsync(int postId, int userId)
        {
            return await _context.Bookmarks
                .FirstOrDefaultAsync(b => b.PostId == postId && b.UserId == userId);
        }

        public async Task<List<PostBookmark>> GetUserBookmarksAsync(int userId, int page = 1, int pageSize = 15)
        {
            return await _context.Bookmarks
                .Include(b => b.Post)
                    .ThenInclude(p => p.User)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<bool> HasUserBookmarkedAsync(int postId, int userId)
        {
            return await _context.Bookmarks
                .AnyAsync(b => b.PostId == postId && b.UserId == userId);
        }

        public async Task<bool> RemoveBookmarkAsync(int postId, int userId)
        {
            var bookmark = await GetUserBookmarkAsync(postId, userId);
            if (bookmark != null)
                return false;

            _context.Bookmarks.Remove(bookmark);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
