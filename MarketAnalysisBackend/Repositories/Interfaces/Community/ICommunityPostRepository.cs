using MarketAnalysisBackend.Models.Community;

namespace MarketAnalysisBackend.Repositories.Interfaces.Community
{
    public interface ICommunityPostRepository
    {
        Task<CommunityPost?> GetByIdAsync(int id, bool includeDeleted = false);
        Task<CommunityPost?> GetByIdWithDetailsAsync(int id);
        Task<List<CommunityPost>> GetAllAsync(int page = 1, int pageSize = 10, string sortBy = "CreatedAt", bool includeDeleted = false);
        Task<List<CommunityPost>> GetByUserIdAsync(int userId, int page = 1, int pageSize = 10);
        Task<List<CommunityPost>> GetTrendingAsync(int hours = 24, int limit = 10);
        Task<List<CommunityPost>> GetByTopicAsync(int topicId, int page = 1, int pageSize = 5);
        Task<List<CommunityPost>> SearchAsync(string query, int page = 1, int pageSize = 5);
        Task<CommunityPost> CreateAsync(CommunityPost post);
        Task<CommunityPost> UpdateAsync(CommunityPost post);
        Task<bool> DeleteAsync(int id, bool softDelete = true);
        Task<bool> TogglePinAsync(int id);
        Task<int> IncrementViewCountAsync(int id);
        Task<int> GetTotalCountAsync();
    }
}
