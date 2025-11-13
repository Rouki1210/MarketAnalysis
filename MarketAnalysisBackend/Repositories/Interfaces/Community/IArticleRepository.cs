using MarketAnalysisBackend.Models.Community;

namespace MarketAnalysisBackend.Repositories.Interfaces.Community
{
    public interface IArticleRepository
    {
        Task<Article?> GetByIdAsync(int id);
        Task<List<Article>> GetAllAsync(int page = 1, int pageSize = 15);
        Task<List<Article>> GetByCategoryAsync(string category, int page = 1, int pageSize = 15);
        Task<List<Article>> GetPublishedAsync(int page = 1, int pageSize = 15);
        Task<Article> CreateAsync(Article article);
        Task<Article> UpdateAsync(Article article);
        Task<bool> DeleteAsync(int id);
        Task<int> IncrementViewCountAsync(int id);
    }
}
