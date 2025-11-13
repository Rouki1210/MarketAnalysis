using MarketAnalysisBackend.Models.DTO;

namespace MarketAnalysisBackend.Services.Interfaces.Community
{
    public interface IArticleService
    {
        Task<ArticleDto> GetArticleByIdAsync(int id);
        Task<PaginatedResponse<ArticleDto>> GetArticlesAsync(int page = 1, int pageSize = 15);
        Task<PaginatedResponse<ArticleDto>> GetArticlesByCategoryAsync(string category, int page = 1, int pageSize = 15);
        Task<ArticleDto> CreateArticleAsync(CreateArticleDto createArticleDto, int? authorUserId = null);
        Task<ArticleDto> UpdateArticleAsync(int id, UpdateArticleDto updateArticleDto);
        Task<bool> DeleteArticleAsync(int id);
        Task<int> IncrementViewCountAsync(int id);
    }
}
