using MarketAnalysisBackend.Authorization;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Services.Interfaces.Community;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Nethereum.Contracts;
using System.Security.Claims;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommunityPostController : Controller
    {
        private readonly ICommunityPostService _post;
        private readonly ICommunityNotificationService _notificationService;
        public CommunityPostController(ICommunityPostService post, ICommunityNotificationService notificationService)
        {
            _post = post;
            _notificationService = notificationService;
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }
        [HttpGet]
        public async Task<ActionResult<PaginatedResponse<CommunityPostDto>>> GetPosts(
            [FromQuery] PaginationRequest request)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var posts = await _post.GetPostsAsync(request, currentUserId);
                return Ok(ApiResponse<PaginatedResponse<CommunityPostDto>>.SuccessResponse(posts));
            }
            catch (Exception ex)
            {
                return BadRequest();
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<CommunityPostDto>>> GetPostById(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var post = await _post.GetPostByIdAsync(id, currentUserId);

                if (post == null)
                    return NotFound(ApiResponse<CommunityPostDto>.ErrorResponse("Post not found"));

                var dto = new CommunityPostDto
                {
                    Id = post.Id,
                    Title = post.Title,
                    Content = post.Content,
                    Author = new UserBasicDto
                    {
                        Id = post.User.Id,
                        Username = post.User.Username,
                        DisplayName = post.User.DisplayName,
                        AvatarEmoji = post.User.AvartarUrl,
                    },
                    Likes = post.LikeCount,
                    Comments = post.CommentCount,
                    Bookmarks = post.BookmarksCount,
                    Tags = post.Tags.Select(t => t.TagName).ToList(),
                    Topics = post.Topics.Select(t => new TopicBasicDto
                    {
                        Id = t.Topic.Id,
                        Name = t.Topic.Name,
                    }).ToList(),
                    CreatedAt = post.CreatedAt,
                    UpdatedAt = post.UpdatedAt,
                    ViewCount = post.ViewCount,
                    IsPinned = post.IsPinned,
                    IsLiked = post.Reactions.Any(r => r.UserId == currentUserId && r.ReactionType == "like"),
                    IsBookmarked = post.Bookmarks.Any(b => b.UserId == currentUserId)
                };
                return Ok(ApiResponse<CommunityPostDto>.SuccessResponse(dto, "Post retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<CommunityPostDto>.ErrorResponse("Failed to retrieve post"));
            }
        }

        [HttpGet("trending")]
        public async Task<ActionResult<ApiResponse<List<CommunityPostDto>>>> GetTrendingPosts(
            [FromQuery] int hours = 24,
            [FromQuery] int limit = 10)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var posts = await _post.GetTrendingPostsAsync(hours, limit, currentUserId);
                return Ok(ApiResponse<List<CommunityPostDto>>.SuccessResponse(posts));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<List<CommunityPostDto>>.ErrorResponse("Failed to retrieve trending posts"));
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<ApiResponse<PaginatedResponse<CommunityPostDto>>>> GetUserPosts(
            int userId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var posts = await _post.GetUserPostsAsync(userId, page, pageSize, currentUserId);
                return Ok(ApiResponse<PaginatedResponse<CommunityPostDto>>.SuccessResponse(posts));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<PaginatedResponse<CommunityPostDto>>.ErrorResponse("Failed to retrieve user posts"));
            }
        }

        [HttpGet("topic/{topicId}")]
        public async Task<ActionResult<ApiResponse<PaginatedResponse<CommunityPostDto>>>> GetPostsByTopic(
            int topicId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var posts = await _post.GetPostsByTopicAsync(topicId, page, pageSize, currentUserId);
                return Ok(ApiResponse<PaginatedResponse<CommunityPostDto>>.SuccessResponse(posts));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<PaginatedResponse<CommunityPostDto>>.ErrorResponse("Failed to retrieve posts by topic"));
            }
        }


        [RequireRole("User")]
        [HttpPost]
        public async Task<ActionResult<ApiResponse<CommunityPostDto>>> CreatePost([FromBody] CreatePostDto createPostDto)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                    return Unauthorized(ApiResponse<CommunityPostDto>.ErrorResponse("User not authenticated"));

                if (string.IsNullOrWhiteSpace(createPostDto.Title) || string.IsNullOrWhiteSpace(createPostDto.Content))
                    return BadRequest(ApiResponse<CommunityPostDto>.ErrorResponse("Title and content are required"));

                var post = await _post.CreatePostAsync(createPostDto, currentUserId.Value);
                return CreatedAtAction(nameof(GetPostById), new { id = post.Id },
                    ApiResponse<CommunityPostDto>.SuccessResponse(post, "Post created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<CommunityPostDto>.ErrorResponse("Failed to create post"));
            }
        }

        [RequireRole("User")]
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<CommunityPostDto>>> UpdatePost(
            int id,
            [FromBody] UpdatePostDto updatePostDto)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                    return Unauthorized(ApiResponse<CommunityPostDto>.ErrorResponse("User not authenticated"));

                var post = await _post.UpdatePostAsync(id, updatePostDto, currentUserId.Value);
                return Ok(ApiResponse<CommunityPostDto>.SuccessResponse(post, "Post updated successfully"));
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<CommunityPostDto>.ErrorResponse("Post not found"));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<CommunityPostDto>.ErrorResponse("Failed to update post"));
            }
        }

        [RequireRole("User", "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeletePost(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                    return Unauthorized(ApiResponse<bool>.ErrorResponse("User not authenticated"));

                var result = await _post.DeletePostAsync(id, currentUserId.Value);

                if (!result)
                    return NotFound(ApiResponse<bool>.ErrorResponse("Post not found"));

                return Ok(ApiResponse<bool>.SuccessResponse(true, "Post deleted successfully"));
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("Failed to delete post"));
            }
        }

        [HttpGet("test-require-role")]
        [RequireRole("Admin")]
        public IActionResult TestRequireRole()
        {
            var userId = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = User?.FindFirst(ClaimTypes.Name)?.Value;
            var roles = User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

            return Ok(new
            {
                success = true,
                message = "✅ RequireRole check passed!",
                userId = userId,
                userName = userName,
                roles = roles,
                requiredRole = "Admin"
            });
        }

        [RequireRole("User")]
        [HttpPost("{id}/like")]
        public async Task<ActionResult<ApiResponse<bool>>> ToggleLike(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var post = await _post.GetPostByIdAsync(id);
                if (!currentUserId.HasValue)
                    return Unauthorized(ApiResponse<bool>.ErrorResponse("User not authenticated"));

                var isLiked = await _post.ToggleLikeAsync(id, currentUserId.Value);

                if(post.UserId != currentUserId.Value)
                {
                    try
                    {
                        await _notificationService.NotifyUserAsync(
                            userId: post.UserId,
                            actorUserId: currentUserId.Value,
                            notificationType: "Like",
                            entityType: "Post",
                            entityId: id,
                            message: "Liked your post");
                    }catch(Exception ex)
                    {
                        
                    }
                }
                var message = isLiked ? "Post liked" : "Post unliked";

                return Ok(ApiResponse<bool>.SuccessResponse(isLiked, message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("Failed to toggle like"));
            }
        }

        [HttpPost("{id}/bookmark")]
        public async Task<ActionResult<ApiResponse<bool>>> ToggleBookmark(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                    return Unauthorized(ApiResponse<bool>.ErrorResponse("User not authenticated"));

                var isBookmarked = await _post.ToggleBookmarkAsync(id, currentUserId.Value);
                var message = isBookmarked ? "Post bookmarked" : "Bookmark removed";

                return Ok(ApiResponse<bool>.SuccessResponse(isBookmarked, message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("Failed to toggle bookmark"));
            }
        }

        [RequireRole("Admin")]
        [HttpPost("{id}/pin")]
        public async Task<ActionResult<ApiResponse<bool>>> TogglePin(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                    return Unauthorized(ApiResponse<bool>.ErrorResponse("User not authenticated"));

                var result = await _post.TogglePinPostAsync(id, currentUserId.Value, isAdmin: true);
                return Ok(ApiResponse<bool>.SuccessResponse(result, "Post pin status toggled"));
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("Failed to toggle pin"));
            }
        }
    }
}
