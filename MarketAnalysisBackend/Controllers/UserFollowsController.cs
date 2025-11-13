using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Services.Interfaces.Community;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserFollowsController : ControllerBase
    {
        private readonly IUserFollowService _followService;
        private readonly ILogger<IUserFollowService> _logger;

        public UserFollowsController(IUserFollowService followService, ILogger<IUserFollowService> logger)
        {
            _followService = followService;
            _logger = logger;
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        [HttpPost("{userId}")]
        public async Task<ActionResult<ApiResponse<bool>>> FollowUser(int userId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                {
                    return Unauthorized(ApiResponse<bool>.ErrorResponse("User not authenticated"));
                }

                var result = await _followService.FollowUserAsync(currentUserId.Value, userId);

                if (!result)
                    return BadRequest(ApiResponse<bool>.ErrorResponse("Already following this user or invalid operation"));

                return Ok(ApiResponse<bool>.SuccessResponse(true, "User followed successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<bool>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error following user: {UserId}", userId);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("Failed to follow user"));
            }
        }

        [HttpDelete("{userId}")]
        public async Task<ActionResult<ApiResponse<bool>>> UnfollowUser(int userId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                    return Unauthorized(ApiResponse<bool>.ErrorResponse("User not authenticated"));

                var result = await _followService.UnfollowUserAsync(currentUserId.Value, userId);

                if (!result)
                    return NotFound(ApiResponse<bool>.ErrorResponse("Follow relationship not found"));

                return Ok(ApiResponse<bool>.SuccessResponse(true, "User unfollowed successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unfollowing user: {UserId}", userId);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("Failed to unfollow user"));
            }
        }

        [HttpGet("{userId}/is-following")]
        public async Task<ActionResult<ApiResponse<bool>>> IsFollowing(int userId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                    return Unauthorized(ApiResponse<bool>.ErrorResponse("User not authenticated"));

                var isFollowing = await _followService.IsFollowingAsync(currentUserId.Value, userId);
                return Ok(ApiResponse<bool>.SuccessResponse(isFollowing));
            }catch(Exception ex)
            {
                _logger.LogError(ex, "Error checking follow status for user: {UserId}", userId);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("Failed to check follow status"));
            }
        }

        [HttpGet("{userId}/follower")]
        public async Task<ActionResult<ApiResponse<List<UserFollowDto>>>> GetFollowers(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var followers = await _followService.GetFollowersAsync(userId, page, pageSize);
                return Ok(ApiResponse<List<UserFollowDto>>.SuccessResponse(followers));
            }catch(Exception ex)
            {
                _logger.LogError(ex, "Error getting followers for user: {UserId}", userId);
                return StatusCode(500, ApiResponse<List<UserFollowDto>>.ErrorResponse("Failed to retrieve followers"));
            }
        }

        [HttpGet("{userId}/following")]
        public async Task<ActionResult<ApiResponse<List<UserFollowDto>>>> GetFollowing(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var following = await _followService.GetFollowingAsync(userId, page, pageSize);
                return Ok(ApiResponse<List<UserFollowDto>>.SuccessResponse(following));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting following for user: {UserId}", userId);
                return StatusCode(500, ApiResponse<List<UserFollowDto>>.ErrorResponse("Failed to retrieve following"));
            }
        }

        [HttpGet("{userId}/stats")]
        public async Task<ActionResult<ApiResponse<FollowStatsDto>>> GetFollowStats(int userId)
        {
            try
            {
                var stats = await _followService.GetFollowStatsAsync(userId);
                return Ok(ApiResponse<FollowStatsDto>.SuccessResponse(stats));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting follow stats for user: {UserId}", userId);
                return StatusCode(500, ApiResponse<FollowStatsDto>.ErrorResponse("Failed to retrieve follow stats"));
            }
        }
    }
}
