using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Services.Interfaces.Community;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly ILogger<CommentController> _logger;
        private readonly ICommentService _commentService;

        public CommentController(ILogger<CommentController> logger, ICommentService commentService)
        {
            _logger = logger;
            _commentService = commentService;
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        [HttpGet("post/{postId}")]
        public async Task<ActionResult<ApiResponse<List<CommentDto>>>> GetPostComments(
            int postId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var comments = await _commentService.GetPostCommentsAsync(postId, page, pageSize);
                return Ok(ApiResponse<List<CommentDto>>.SuccessResponse(comments));
            } catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting comments for post: {PostId}", postId);
                return StatusCode(500, ApiResponse<List<CommentDto>>.ErrorResponse("Failed to retrieve comments"));
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<ApiResponse<List<CommentDto>>>> GetUserComments(
            int userId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15)
        {
            try
            {
                var comments = await _commentService.GetUserCommentsAsync(userId, page, pageSize);
                return Ok(ApiResponse<List<CommentDto>>.SuccessResponse(comments));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting comments for user: {UserId}", userId);
                return StatusCode(500, ApiResponse<List<CommentDto>>.ErrorResponse("Failed to retrieve user comments"));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<CommentDto>>> GetCommentById(int id)
        {
            try
            {
                var comments = await _commentService.GetCommentByIdAsync(id);
                if (comments == null)
                    return NotFound(ApiResponse<CommentDto>.ErrorResponse("Comment not found"));

                return Ok(ApiResponse<CommentDto>.SuccessResponse(null!, "Comment retrieved successfully"));
            }catch(Exception ex)
            {
                _logger.LogError(ex, "Error getting comment: {CommentId}", id);
                return StatusCode(500, ApiResponse<CommentDto>.ErrorResponse("Failed to retrieve comment"));
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<ApiResponse<CommentDto>>> CreateCommnent([FromBody] CreateCommentDto createCommentDto)
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
                return Unauthorized(ApiResponse<CommentDto>.ErrorResponse("User not authenticated"));

            if (string.IsNullOrWhiteSpace(createCommentDto.Content))
                return BadRequest(ApiResponse<CommentDto>.ErrorResponse("Comment content is required"));

            var comment = await _commentService.CreateCommentAsync(createCommentDto, currentUserId.Value);

            return CreatedAtAction(nameof(GetCommentById), new { id = comment.Id },
                    ApiResponse<CommentDto>.SuccessResponse(comment, "Comment created successfully"));
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<CommentDto>>> UpdateComment(
            int id,
            [FromBody] UpdateCommentDto updateCommentDto)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                    return Unauthorized(ApiResponse<CommentDto>.ErrorResponse("User not authenticated"));

                if (string.IsNullOrWhiteSpace(updateCommentDto.Content))
                    return BadRequest(ApiResponse<CommentDto>.ErrorResponse("Comment content is required"));

                var comment = await _commentService.UpdateCommentAsync(id, updateCommentDto, currentUserId.Value);
                return Ok(ApiResponse<CommentDto>.SuccessResponse(comment, "Comment updated successfully"));
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<CommentDto>.ErrorResponse("Comment not found"));
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating comment: {CommentId}", id);
                return StatusCode(500, ApiResponse<CommentDto>.ErrorResponse("Failed to update comment"));
            }
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteComment(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                    return Unauthorized(ApiResponse<bool>.ErrorResponse("User not authenticated"));

                var result = await _commentService.DeleteCommentAsync(id, currentUserId.Value);

                if (!result)
                    return NotFound(ApiResponse<bool>.ErrorResponse("Comment not found"));

                return Ok(ApiResponse<bool>.SuccessResponse(true, "Comment deleted successfully"));
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting comment: {CommentId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("Failed to delete comment"));
            }
        }
    }
}
