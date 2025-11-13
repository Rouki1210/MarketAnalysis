using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models.Community;
using MarketAnalysisBackend.Repositories.Interfaces.Community;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations.Community
{
    public class CommentRepository : ICommentRepository
    {
        private readonly AppDbContext _context;
        public CommentRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Comment> CreateAsync(Comment comment)
        {
            comment.CreatedAt = DateTime.UtcNow;
            comment.LastUpdatedAt = DateTime.UtcNow;

            await _context.Comments.AddAsync(comment);
            await _context.SaveChangesAsync();

            return comment;
        }

        public async Task<bool> DeleteAsync(int id, bool softDelete = true)
        {
            var comment = await _context.Comments.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == id);
            if (comment == null)
                return false;

            if (softDelete)
            {
                comment.DeletedAt = DateTime.UtcNow;
                _context.Comments.Update(comment);
            }
            else
            {
                _context.Comments.Remove(comment);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Comment?> GetByIdAsync(int id)
        {
            return await _context.Comments.FindAsync(id);
        }

        public async Task<Comment?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.Comments
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<int> GetCommentCountAsync(int postId)
        {
            return await _context.Comments.CountAsync(c => c.PostId == postId);
        }

        public Task<List<Comment>> GetPostCommentsAsync(int postId, int page = 1, int pageSize = 50)
        {
            return _context.Comments
                .Include(c => c.User)
                .Where(c => c.PostId == postId)
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<List<Comment>> GetUserCommentsAsync(int userId, int page = 1, int pageSize = 15)
        {
            return await _context.Comments
                .Include(c => c.Post)
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<Comment> UpdateAsync(Comment comment)
        {
            comment.LastUpdatedAt = DateTime.UtcNow;

            _context.Comments.Update(comment);
            await _context.SaveChangesAsync();

            return comment;
        }
    }
}
