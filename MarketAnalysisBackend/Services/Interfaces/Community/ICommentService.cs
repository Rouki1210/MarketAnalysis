using MarketAnalysisBackend.Models.Community;
using MarketAnalysisBackend.Models.DTO;

namespace MarketAnalysisBackend.Services.Interfaces.Community
{
    public interface ICommentService
    {
        Task<Comment?> GetCommentByIdAsync(int id);
        Task<List<CommentDto>> GetPostCommentsAsync(int postId, int page = 1, int pageSize = 50, int? currentUserId = null);
        Task<List<CommentDto>> GetUserCommentsAsync(int userId, int page = 1, int pageSize = 15);
        Task<CommentDto> CreateCommentAsync(CreateCommentDto createCommentDto, int userId);
        Task<CommentDto> UpdateCommentAsync(int id, UpdateCommentDto updateCommentDto, int userId);
        Task<bool> DeleteCommentAsync(int id, int userId, bool isAdmin = false);
    }
}
