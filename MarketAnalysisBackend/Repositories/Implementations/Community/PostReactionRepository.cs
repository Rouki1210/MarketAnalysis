using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models.Community;
using MarketAnalysisBackend.Repositories.Interfaces.Community;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations.Community
{
    public class PostReactionRepository : IPostReactionRepository
    {
        private readonly AppDbContext _context;
        public PostReactionRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<PostReaction> AddReactionAsync(PostReaction reaction)
        {
            reaction.CreatedAt = DateTime.UtcNow;

            await _context.PostReactions.AddAsync(reaction);
            await _context.SaveChangesAsync();

            return reaction;
        }

        public async Task<PostReaction?> GetByIdAsync(int id)
        {
            return await _context.PostReactions.FindAsync(id);
        }

        public async Task<List<PostReaction>> GetPostReactionsAsync(int postId)
        {
            return await _context.PostReactions
                .Include(r => r.User)
                .Where(r => r.PostId == postId)
                .ToListAsync();
        }

        public async Task<int> GetReactionCountAsync(int postId, string reactionType = "like")
        {
            return await _context.PostReactions.CountAsync(r => r.PostId == postId && r.ReactionType == reactionType);
        }

        public async Task<PostReaction?> GetUserReactionAsync(int postId, int userId, string reactionType = "like")
        {
            return await _context.PostReactions.FirstOrDefaultAsync(r => r.PostId == postId && r.UserId == userId && r.ReactionType == reactionType);
        }

        public async Task<bool> HasUserReactedAsync(int postId, int userId, string reactionType = "like")
        {
            return await _context.PostReactions
               .AnyAsync(r => r.PostId == postId && r.UserId == userId && r.ReactionType == reactionType);
        }

        public async Task<bool> RemoveReactionAsync(int postId, int userId, string reactionType = "like")
        {
            var reaction = await GetUserReactionAsync(postId, userId, reactionType);
            if (reaction == null)
                return false;

            _context.PostReactions.Remove(reaction);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
