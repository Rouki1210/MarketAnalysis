using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Services.Interfaces.Community;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TopicController : ControllerBase
    {
        private readonly ILogger<TopicController> _logger;
        private readonly ITopicService _topicService;
        private readonly ICommunityPostService _communityPostService;
        public TopicController(ILogger<TopicController> logger, ITopicService topicService, ICommunityPostService communityPostService)
        {
            _logger = logger;
            _topicService = topicService;
            _communityPostService = communityPostService;
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<TopicDto>>>> GetAllTopics()
        {
            try
            {
                var topics = await _topicService.GetAllTopicsAsync();
                return Ok(ApiResponse<List<TopicDto>>.SuccessResponse(topics));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all topics");
                return StatusCode(500, ApiResponse<List<TopicDto>>.ErrorResponse("An error occurred while fetching topics."));
            }
        }

        [HttpGet("popular")]
        public async Task<ActionResult<ApiResponse<List<TopicDto>>>> GetPopularTopics([FromQuery] int limit = 10)
        {
            try
            {
                if (limit < 1 || limit > 50)
                {
                    return BadRequest(ApiResponse<List<TopicDto>>.ErrorResponse("Limit must be between 1 and 50."));
                }
                var topics = await _topicService.GetPopularTopicsAsync(limit);
                return Ok(ApiResponse<List<TopicDto>>.SuccessResponse(topics));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching popular topics");
                return StatusCode(500, ApiResponse<List<TopicDto>>.ErrorResponse("An error occurred while fetching popular topics."));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<TopicDto>>> GetTopicById(int id)
        {
            try
            {
                var topic = await _topicService.GetTopicByIdAsync(id);
                if (topic == null)
                {
                    return NotFound(ApiResponse<TopicDto>.ErrorResponse("Topic not found."));
                }
                var currentUserId = GetCurrentUserId();
                var isFollowing = false;
                if (currentUserId.HasValue)
                {
                    isFollowing = await _topicService.IsFollowingTopicAsync(id, currentUserId.Value);
                }

                var topicDto = new TopicDto
                {
                    Id = topic.Id,
                    Name = topic.Name,
                    Slug = topic.Slug,
                    Icon = topic.Icon,
                    Description = topic.Description,
                    PostCount = topic.PostCount,
                    FollowerCount = topic.FollowerCount,
                    IsFollowing = isFollowing,
                    CreatedAt = topic.CreatedAt
                };
                return Ok(ApiResponse<TopicDto>.SuccessResponse(topicDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching topic with ID {id}");
                return StatusCode(500, ApiResponse<TopicDto>.ErrorResponse("An error occurred while fetching the topic."));
            }
        }

        [HttpGet("slug/{slug}")]
        public async Task<ActionResult<ApiResponse<TopicDto>>> GetTopicBySlug(string slug)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(slug))
                    return BadRequest(ApiResponse<TopicDto>.ErrorResponse("Slug is required"));

                var topic = await _topicService.GetTopicBySlugAsync(slug);
                if (topic == null)
                    return NotFound(ApiResponse<TopicDto>.ErrorResponse("Topic not found"));

                var currentUserId = GetCurrentUserId();
                var isFollowing = false;

                if (currentUserId.HasValue)
                {
                    isFollowing = await _topicService.IsFollowingTopicAsync(topic.Id, currentUserId.Value);
                }

                var topicDto = new TopicDto
                {
                    Id = topic.Id,
                    Name = topic.Name,
                    Slug = topic.Slug,
                    Icon = topic.Icon,
                    Description = topic.Description,
                    PostCount = topic.PostCount,
                    FollowerCount = topic.FollowerCount,
                    IsFollowing = isFollowing,
                    CreatedAt = topic.CreatedAt
                };

                return Ok(ApiResponse<TopicDto>.SuccessResponse(topicDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting topic by slug: {Slug}", slug);
                return StatusCode(500, ApiResponse<TopicDto>.ErrorResponse("Failed to retrieve topic"));
            }
        }

        [HttpGet("{id}/posts")]
        public async Task<ActionResult<ApiResponse<PaginatedResponse<CommunityPostDto>>>> GetPostsByTopic(
            int id,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var posts = await _communityPostService.GetPostsByTopicAsync(id, page, pageSize, currentUserId);
                return Ok(ApiResponse<PaginatedResponse<CommunityPostDto>>.SuccessResponse(posts));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching posts for topic ID {id}");
                return StatusCode(500, ApiResponse<PaginatedResponse<CommunityPostDto>>.ErrorResponse("An error occurred while fetching posts for the topic."));
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<ApiResponse<TopicDto>>> CreateTopic(
            [FromBody] CreateTopicDto createTopicDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(createTopicDto.Name))
                    return BadRequest(ApiResponse<TopicDto>.ErrorResponse("Topic name is required"));

                var topic = await _topicService.CreateTopicAsync(createTopicDto);
                return CreatedAtAction(nameof(GetTopicById), new { id = topic.Id },
                    ApiResponse<TopicDto>.SuccessResponse(topic, "Topic created successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating topic");
                return StatusCode(500, ApiResponse<TopicDto>.ErrorResponse("Failed to create topic"));
            }
        }

        // PUT: api/community/topics/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<TopicDto>>> UpdateTopic(
            int id,
            [FromBody] UpdateTopicDto updateTopicDto)
        {
            try
            {
                var topic = await _topicService.UpdateTopicAsync(id, updateTopicDto);
                return Ok(ApiResponse<TopicDto>.SuccessResponse(topic, "Topic updated successfully"));
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<TopicDto>.ErrorResponse("Topic not found"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating topic: {TopicId}", id);
                return StatusCode(500, ApiResponse<TopicDto>.ErrorResponse("Failed to update topic"));
            }
        }

        // DELETE: api/community/topics/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteTopic(int id)
        {
            try
            {
                var result = await _topicService.DeleteTopicAsync(id);

                if (!result)
                    return NotFound(ApiResponse<bool>.ErrorResponse("Topic not found"));

                return Ok(ApiResponse<bool>.SuccessResponse(true, "Topic deleted successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting topic: {TopicId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("Failed to delete topic"));
            }
        }

        // POST: api/community/topics/{id}/follow
        [Authorize]
        [HttpPost("{id}/follow")]
        public async Task<ActionResult<ApiResponse<bool>>> FollowTopic(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                    return Unauthorized(ApiResponse<bool>.ErrorResponse("User not authenticated"));

                var result = await _topicService.FollowTopicAsync(id, currentUserId.Value);
                var message = result ? "Topic followed successfully" : "Already following this topic";

                return Ok(ApiResponse<bool>.SuccessResponse(result, message));
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Topic not found"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error following topic: {TopicId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("Failed to follow topic"));
            }
        }

        // DELETE: api/community/topics/{id}/follow
        [Authorize]
        [HttpDelete("{id}/follow")]
        public async Task<ActionResult<ApiResponse<bool>>> UnfollowTopic(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                    return Unauthorized(ApiResponse<bool>.ErrorResponse("User not authenticated"));

                var result = await _topicService.UnfollowTopicAsync(id, currentUserId.Value);

                if (!result)
                    return NotFound(ApiResponse<bool>.ErrorResponse("Not following this topic"));

                return Ok(ApiResponse<bool>.SuccessResponse(true, "Topic unfollowed successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unfollowing topic: {TopicId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("Failed to unfollow topic"));
            }
        }

        // GET: api/community/topics/{id}/is-following
        [Authorize]
        [HttpGet("{id}/is-following")]
        public async Task<ActionResult<ApiResponse<bool>>> IsFollowingTopic(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                    return Unauthorized(ApiResponse<bool>.ErrorResponse("User not authenticated"));

                var isFollowing = await _topicService.IsFollowingTopicAsync(id, currentUserId.Value);
                return Ok(ApiResponse<bool>.SuccessResponse(isFollowing));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking follow status for topic: {TopicId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("Failed to check follow status"));
            }
        }
    }
}
