using MarketAnalysisBackend.Models.Community;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Interfaces.Community;
using MarketAnalysisBackend.Services.Interfaces.Community;

namespace MarketAnalysisBackend.Services.Implementations.Community
{
    public class ArticleService : IArticleService
    {
        private readonly IArticleRepository _articleRepository;
        public ArticleService(IArticleRepository articleRepository)
        {
            _articleRepository = articleRepository;
        }
        public async Task<ArticleDto> CreateArticleAsync(CreateArticleDto createArticleDto, int? authorUserId = null)
        {
            var article = new Article
            {
                Title = createArticleDto.Title,
                Summary = createArticleDto.Summary,
                Content = createArticleDto.Content,
                Category = createArticleDto.Category,
                SourceUrl = createArticleDto.SourceUrl,
                ImageUrl = createArticleDto.ImageUrl,
                IsPublished = createArticleDto.IsPublished,
                AuthorUserId = authorUserId
            };

            var createdArticle = await _articleRepository.CreateAsync(article);
            return MapToArticleDto(createdArticle);
        }

        public async Task<bool> DeleteArticleAsync(int id)
        {
            return await _articleRepository.DeleteAsync(id);
        }

        public async Task<ArticleDto> GetArticleByIdAsync(int id)
        {
            var article = await _articleRepository.GetByIdAsync(id);
            if (article == null)
                return null;

            await _articleRepository.IncrementViewCountAsync(id);
            return MapToArticleDto(article);
        }

        public async Task<PaginatedResponse<ArticleDto>> GetArticlesAsync(int page = 1, int pageSize = 15)
        {
            var articles = await _articleRepository.GetAllAsync(page, pageSize);
            var totalCount = articles.Count; // This should ideally come from a count query in the repository

            var articleDtos = articles.Select(a => MapToArticleDto(a)).ToList();

            return new PaginatedResponse<ArticleDto>
            {
                Data = articleDtos,
                CurrentPage = page,
                PageSize = pageSize,
                TotalItems = totalCount,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                HasPrevious = page > 1,
                HasNext = page < (int)Math.Ceiling((double)totalCount / pageSize)
            };
        }

        public async Task<PaginatedResponse<ArticleDto>> GetArticlesByCategoryAsync(string category, int page = 1, int pageSize = 15)
        {
            var articles = await _articleRepository.GetByCategoryAsync(category, page, pageSize);
            var totalCount = articles.Count;

            var articleDtos = articles.Select(a => MapToArticleDto(a)).ToList();

            return new PaginatedResponse<ArticleDto>
            {
                Data = articleDtos,
                CurrentPage = page,
                PageSize = pageSize,
                TotalItems = totalCount,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                HasPrevious = page > 1,
                HasNext = page < (int)Math.Ceiling((double)totalCount / pageSize)
            };
        }

        public async Task<int> IncrementViewCountAsync(int id)
        {
            return await _articleRepository.IncrementViewCountAsync(id);
        }

        public async Task<ArticleDto> UpdateArticleAsync(int id, UpdateArticleDto updateArticleDto)
        {
            var article = await _articleRepository.GetByIdAsync(id);
            if (article == null)
                throw new KeyNotFoundException("Article not found");

            if (!string.IsNullOrEmpty(updateArticleDto.Title))
                article.Title = updateArticleDto.Title;

            if (!string.IsNullOrEmpty(updateArticleDto.Summary))
                article.Summary = updateArticleDto.Summary;

            if (updateArticleDto.Content != null)
                article.Content = updateArticleDto.Content;

            if (!string.IsNullOrEmpty(updateArticleDto.Category))
                article.Category = updateArticleDto.Category;

            if (updateArticleDto.SourceUrl != null)
                article.SourceUrl = updateArticleDto.SourceUrl;

            if (updateArticleDto.ImageUrl != null)
                article.ImageUrl = updateArticleDto.ImageUrl;

            if (updateArticleDto.IsPublished.HasValue)
                article.IsPublished = updateArticleDto.IsPublished.Value;

            var updatedArticle = await _articleRepository.UpdateAsync(article);
            return MapToArticleDto(updatedArticle);

        }

        private ArticleDto MapToArticleDto(Article article)
        {
            UserBasicDto? authorDto = null;
            if (article.Author != null)
            {
                authorDto = new UserBasicDto
                {
                    Id = article.Author.Id,
                    Username = article.Author.Username,
                    DisplayName = article.Author.DisplayName,
                    AvatarEmoji = article.Author.AvartarUrl,
                    IsVerified = article.Author.IsVerified
                };
            }

            return new ArticleDto
            {
                Id = article.Id,
                Title = article.Title,
                Summary = article.Summary,
                Content = article.Content,
                Category = article.Category,
                Author = authorDto,
                SourceUrl = article.SourceUrl,
                ImageUrl = article.ImageUrl,
                ViewCount = article.ViewCount,
                IsPublished = article.IsPublished,
                PublishedAt = article.PublishedAt,
                CreatedAt = article.CreatedAt
            };
        }
    }
}
