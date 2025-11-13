using MarketAnalysisBackend.Models.Community;

namespace MarketAnalysisBackend.Repositories.Interfaces.Community
{
    public interface IPostReactionRepository
    {
        Task<PostReaction?> GetByIdAsync(int id);
        Task<PostReaction?> GetUserReactionAsync(int postId, int userId, string reactionType = "like");
        Task<List<PostReaction>> GetPostReactionsAsync(int postId);
        Task<int> GetReactionCountAsync(int postId, string reactionType = "like");
        Task<PostReaction> AddReactionAsync(PostReaction reaction);
        Task<bool> RemoveReactionAsync(int postId, int userId, string reactionType = "like");
        Task<bool> HasUserReactedAsync(int postId, int userId, string reactionType = "like");
    }
}
