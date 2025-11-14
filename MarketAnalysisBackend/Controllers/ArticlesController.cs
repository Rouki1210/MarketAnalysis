using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Services.Interfaces.Community;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArticlesController : ControllerBase
    {
        private readonly IArticleService _articleService;
        private readonly ILogger<ArticlesController> _logger;
        public ArticlesController(IArticleService articleService, ILogger<ArticlesController> logger)
        {
            _articleService = articleService;
            _logger = logger;
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<PaginatedResponse<ArticleDto>>>> GetArticles([FromQuery] int page = 1, [FromQuery] int pageSize = 15)
        {
            try
            {
                if(page < 1)
                    return BadRequest(ApiResponse<PaginatedResponse<ArticleDto>>.ErrorResponse("Page number must be at least 1."));
                if(pageSize < 1 || pageSize > 100)
                    return BadRequest(ApiResponse<PaginatedResponse<ArticleDto>>.ErrorResponse("Page size must be between 1 and 100."));

                var articles = await _articleService.GetArticlesAsync(page, pageSize);
                return Ok(ApiResponse<PaginatedResponse<ArticleDto>>.SuccessResponse(articles));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching articles.");
                return StatusCode(500, ApiResponse<PaginatedResponse<ArticleDto>>.ErrorResponse("An error occurred while fetching articles."));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<ArticleDto>>> GetArticleById(int id)
        {
            try
            {
                var article = await _articleService.GetArticleByIdAsync(id);
                if (article == null)
                {
                    return NotFound(ApiResponse<ArticleDto>.ErrorResponse("Article not found."));
                }

                return Ok(ApiResponse<ArticleDto>.SuccessResponse(article));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching article with ID {id}.");
                return StatusCode(500, ApiResponse<ArticleDto>.ErrorResponse("An error occurred while fetching the article."));
            }
        }

        [HttpGet("category/{category}")]
        public async Task<ActionResult<ApiResponse<PaginatedResponse<ArticleDto>>>> GetArticlesByCategory(
            string category,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(category))
                    return BadRequest(ApiResponse<PaginatedResponse<ArticleDto>>.ErrorResponse("Category is required"));

                // Validate category
                var validCategories = new[] { "Coin", "Market", "Education" };
                if (!validCategories.Contains(category, StringComparer.OrdinalIgnoreCase))
                    return BadRequest(ApiResponse<PaginatedResponse<ArticleDto>>.ErrorResponse($"Invalid category. Valid categories are: {string.Join(", ", validCategories)}"));

                var articles = await _articleService.GetArticlesByCategoryAsync(category, page, pageSize);
                return Ok(ApiResponse<PaginatedResponse<ArticleDto>>.SuccessResponse(articles));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting articles by category: {Category}", category);
                return StatusCode(500, ApiResponse<PaginatedResponse<ArticleDto>>.ErrorResponse("Failed to retrieve articles by category"));
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<ApiResponse<ArticleDto>>> CreateArticle(
            [FromBody] CreateArticleDto createArticleDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(createArticleDto.Title))
                    return BadRequest(ApiResponse<ArticleDto>.ErrorResponse("Title is required"));

                if (string.IsNullOrWhiteSpace(createArticleDto.Summary))
                    return BadRequest(ApiResponse<ArticleDto>.ErrorResponse("Summary is required"));

                // Validate category
                var validCategories = new[] { "Coin", "Market", "Education" };
                if (!validCategories.Contains(createArticleDto.Category, StringComparer.OrdinalIgnoreCase))
                    return BadRequest(ApiResponse<ArticleDto>.ErrorResponse($"Invalid category. Valid categories are: {string.Join(", ", validCategories)}"));

                var currentUserId = GetCurrentUserId();
                var article = await _articleService.CreateArticleAsync(createArticleDto, currentUserId);

                return CreatedAtAction(nameof(GetArticleById), new { id = article.Id },
                    ApiResponse<ArticleDto>.SuccessResponse(article, "Article created successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating article");
                return StatusCode(500, ApiResponse<ArticleDto>.ErrorResponse("Failed to create article"));
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<ArticleDto>>> UpdateArticle(
            int id,
            [FromBody] UpdateArticleDto updateArticleDto)
        {
            try
            {
                // Validate category if provided
                if (!string.IsNullOrWhiteSpace(updateArticleDto.Category))
                {
                    var validCategories = new[] { "Coin", "Market", "Education" };
                    if (!validCategories.Contains(updateArticleDto.Category, StringComparer.OrdinalIgnoreCase))
                        return BadRequest(ApiResponse<ArticleDto>.ErrorResponse($"Invalid category. Valid categories are: {string.Join(", ", validCategories)}"));
                }

                var article = await _articleService.UpdateArticleAsync(id, updateArticleDto);
                return Ok(ApiResponse<ArticleDto>.SuccessResponse(article, "Article updated successfully"));
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<ArticleDto>.ErrorResponse("Article not found"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating article: {ArticleId}", id);
                return StatusCode(500, ApiResponse<ArticleDto>.ErrorResponse("Failed to update article"));
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteArticle(int id)
        {
            try
            {
                var result = await _articleService.DeleteArticleAsync(id);

                if (!result)
                    return NotFound(ApiResponse<bool>.ErrorResponse("Article not found"));

                return Ok(ApiResponse<bool>.SuccessResponse(true, "Article deleted successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting article: {ArticleId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("Failed to delete article"));
            }
        }

        [HttpPost("{id}/view")]
        public async Task<ActionResult<ApiResponse<int>>> IncrementViewCount(int id)
        {
            try
            {
                var viewCount = await _articleService.IncrementViewCountAsync(id);

                if (viewCount == 0)
                    return NotFound(ApiResponse<int>.ErrorResponse("Article not found"));

                return Ok(ApiResponse<int>.SuccessResponse(viewCount, "View count incremented"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error incrementing view count for article: {ArticleId}", id);
                return StatusCode(500, ApiResponse<int>.ErrorResponse("Failed to increment view count"));
            }
        }

        [HttpGet("categories")]
        public ActionResult<ApiResponse<List<string>>> GetCategories()
        {
            try
            {
                var categories = new List<string> { "Coin", "Market", "Education" };
                return Ok(ApiResponse<List<string>>.SuccessResponse(categories));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting categories");
                return StatusCode(500, ApiResponse<List<string>>.ErrorResponse("Failed to retrieve categories"));
            }
        }
    }
}
