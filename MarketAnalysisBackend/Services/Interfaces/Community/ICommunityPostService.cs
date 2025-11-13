using MarketAnalysisBackend.Models.Community;
using MarketAnalysisBackend.Models.DTO;

namespace MarketAnalysisBackend.Services.Interfaces.Community
{
    public interface ICommunityPostService
    {
        Task<CommunityPost?> GetPostByIdAsync(int id, int? currentUserId = null);
        Task<PaginatedResponse<CommunityPostDto>> GetPostsAsync(PaginationRequest request, int? currentUserId = null);
        Task<PaginatedResponse<CommunityPostDto>> GetUserPostsAsync(int userId, int page = 1, int pageSize = 15, int? currentUserId = null);
        Task<List<CommunityPostDto>> GetTrendingPostsAsync(int hours = 24, int limit = 10, int? currentUserId = null);
        Task<PaginatedResponse<CommunityPostDto>> GetPostsByTopicAsync(int topicId, int page = 1, int pageSize = 15, int? currentUserId = null);
        Task<PaginatedResponse<CommunityPostDto>> SearchPostsAsync(string query, int page = 1, int pageSize = 15, int? currentUserId = null);
        Task<CommunityPostDto> CreatePostAsync(CreatePostDto createPostDto, int userId);
        Task<CommunityPostDto> UpdatePostAsync(int id, UpdatePostDto updatePostDto, int userId);
        Task<bool> DeletePostAsync(int id, int userId, bool isAdmin = false);
        Task<bool> TogglePinPostAsync(int id, int userId, bool isAdmin = false);
        Task<bool> ToggleLikeAsync(int postId, int userId);
        Task<bool> ToggleBookmarkAsync(int postId, int userId);
        Task<int> IncrementViewCountAsync(int id);
    }
}
