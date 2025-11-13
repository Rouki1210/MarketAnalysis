using MarketAnalysisBackend.Models.Community;

namespace MarketAnalysisBackend.Repositories.Interfaces.Community
{
    public interface IPostBookmarkRepository
    {
        Task<PostBookmark?> GetByIdAsync(int id);
        Task<PostBookmark?> GetUserBookmarkAsync(int postId, int userId);
        Task<List<PostBookmark>> GetUserBookmarksAsync(int userId, int page = 1, int pageSize = 15);
        Task<int> GetBookmarkCountAsync(int postId);
        Task<PostBookmark> AddBookmarkAsync(PostBookmark bookmark);
        Task<bool> RemoveBookmarkAsync(int postId, int userId);
        Task<bool> HasUserBookmarkedAsync(int postId, int userId);
    }
}
