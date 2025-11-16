using MarketAnalysisBackend.Authorization;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Services.Interfaces;
using MarketAnalysisBackend.Services.Interfaces.Community;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : Controller
    {
        private readonly ILogger<NotificationController> _logger;
        private readonly ICommunityNotificationService _notificationService;
        public NotificationController(ILogger<NotificationController> logger, ICommunityNotificationService notificationService)
        {
            _logger = logger;
            _notificationService = notificationService;
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        [RequireRole("User")]
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<NotificationDto>>>> GetNotifications(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                {
                    return Unauthorized(ApiResponse<List<NotificationDto>>.ErrorResponse("User not authenticated."));
                }
                if (page < 1)
                    return BadRequest(ApiResponse<List<NotificationDto>>.ErrorResponse("Page must be greater than 0"));

                if (pageSize < 1 || pageSize > 100)
                    return BadRequest(ApiResponse<List<NotificationDto>>.ErrorResponse("Page size must be between 1 and 100"));

                var notifications = await _notificationService.GetUserNotificationsAsync(currentUserId.Value, page, pageSize);
                return Ok(ApiResponse<List<NotificationDto>>.SuccessResponse(notifications));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching notifications.");
                return StatusCode(500, ApiResponse<List<NotificationDto>>.ErrorResponse("An error occurred while fetching notifications."));
            }
        }

        [RequireRole("User")]
        [HttpGet("unread-count")]
        public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount()
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                {
                    return Unauthorized(ApiResponse<int>.ErrorResponse("User not authenticated."));
                }
                var unreadCount = await _notificationService.GetUnreadCountAsync(currentUserId.Value);
                return Ok(ApiResponse<int>.SuccessResponse(unreadCount));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching unread notification count.");
                return StatusCode(500, ApiResponse<int>.ErrorResponse("An error occurred while fetching unread notification count."));
            }
        }

        [RequireRole("User")]
        [HttpPut("{id}/mark-read")]
        public async Task<ActionResult<ApiResponse<bool>>> MarkAsRead(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                    return Unauthorized(ApiResponse<bool>.ErrorResponse("User not authenticated"));

                var result = await _notificationService.MarkAsReadAsync(id, currentUserId.Value);

                if (!result)
                    return NotFound(ApiResponse<bool>.ErrorResponse("Notification not found or access denied"));

                return Ok(ApiResponse<bool>.SuccessResponse(true, "Notification marked as read"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification as read: {NotificationId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("Failed to mark notification as read"));
            }
        }

        [RequireRole("User")]
        [HttpPut("mark-all-read")]
        public async Task<ActionResult<ApiResponse<bool>>> MarkAllAsRead()
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                    return Unauthorized(ApiResponse<bool>.ErrorResponse("User not authenticated"));

                var result = await _notificationService.MarkAllAsReadAsync(currentUserId.Value);
                return Ok(ApiResponse<bool>.SuccessResponse(true, "All notifications marked as read"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read");
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("Failed to mark all notifications as read"));
            }
        }


        [RequireRole("User")]
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteNotification(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (!currentUserId.HasValue)
                    return Unauthorized(ApiResponse<bool>.ErrorResponse("User not authenticated"));

                var result = await _notificationService.DeleteNotificationAsync(id, currentUserId.Value);

                if (!result)
                    return NotFound(ApiResponse<bool>.ErrorResponse("Notification not found or access denied"));

                return Ok(ApiResponse<bool>.SuccessResponse(true, "Notification deleted successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification: {NotificationId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("Failed to delete notification"));
            }
        }

        [RequireRole("User")]
        [HttpGet("types")]
        public ActionResult<ApiResponse<List<string>>> GetNotificationTypes()
        {
            try
            {
                var types = new List<string>
                {
                    "Comment",
                    "Like",
                    "Follow",
                };

                return Ok(ApiResponse<List<string>>.SuccessResponse(types));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching notification types.");
                return StatusCode(500, ApiResponse<List<string>>.ErrorResponse("An error occurred while fetching notification types."));
            }
        }
    }
}
