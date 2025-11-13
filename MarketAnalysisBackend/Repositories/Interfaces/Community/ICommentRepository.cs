using MarketAnalysisBackend.Models.Community;

namespace MarketAnalysisBackend.Repositories.Interfaces.Community
{
    public interface ICommentRepository
    {
        Task<Comment?> GetByIdAsync(int id);
        Task<Comment?> GetByIdWithDetailsAsync(int id);
        Task<List<Comment>> GetPostCommentsAsync(int postId, int page = 1, int pageSize = 50);
        Task<List<Comment>> GetUserCommentsAsync(int userId, int page = 1, int pageSize = 15);
        Task<Comment> CreateAsync(Comment comment);
        Task<Comment> UpdateAsync(Comment comment);
        Task<bool> DeleteAsync(int id, bool softDelete = true);
        Task<int> GetCommentCountAsync(int postId);
    }
}
