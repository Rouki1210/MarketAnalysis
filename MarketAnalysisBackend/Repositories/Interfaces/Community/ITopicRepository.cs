using MarketAnalysisBackend.Models.Community;

namespace MarketAnalysisBackend.Repositories.Interfaces.Community
{
    public interface ITopicRepository
    {
        Task<Topic?> GetByIdAsync(int id);
        Task<Topic?> GetBySlugAsync(string slug);
        Task<List<Topic>> GetAllAsync();
        Task<List<Topic>> GetPopularAsync(int limit = 10);
        Task<Topic> CreateAsync(Topic topic);
        Task<Topic> UpdateAsync(Topic topic);
        Task<bool> DeleteAsync(int id);
        Task<bool> IncrementPostCountAsync(int topicId);
        Task<bool> DecrementPostCountAsync(int topicId);
    }
}
