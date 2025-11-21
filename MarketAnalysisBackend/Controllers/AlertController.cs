using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Services;
using Microsoft.AspNetCore.Mvc;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlertController : Controller
    {
        private readonly IUserAlertService _userAlertService;
        private readonly ILogger<AlertController> _logger;
        public AlertController(IUserAlertService userAlertService, ILogger<AlertController> logger)
        {
            _userAlertService = userAlertService;
            _logger = logger;
        }
        private int GetUserId()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "UserId");
            return int.TryParse(userIdClaim?.Value, out int userId) ? userId : 0;
        }

        [HttpPost]
        [ProducesResponseType(typeof(UserAlertResponseDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> CreateAlert([FromBody] CreateUserAlertDto dto)
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0)
                {
                    return Unauthorized(new { message = "Invalid user" });
                }

                var result = await _userAlertService.CreateAlertAsync(userId, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error creating alert");
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business rule violation creating alert");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating alert");
                return StatusCode(500, new { message = "Failed to create alert" });
            }
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<UserAlertResponseDto>), 200)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> GetAlerts()
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0)
                {
                    return Unauthorized(new { message = "Invalid user" });
                }

                var results = await _userAlertService.GetUserAlertsAsync(userId);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting alerts");
                return StatusCode(500, new { message = "Failed to retrieve alerts" });
            }
        }

        [HttpGet("{alertId}")]
        [ProducesResponseType(typeof(UserAlertResponseDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> GetAlert(int alertId)
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0)
                {
                    return Unauthorized(new { message = "Invalid user" });
                }

                var result = await _userAlertService.GetAlertByIdAsync(userId, alertId);
                if (result == null)
                {
                    return NotFound(new { message = "Alert not found" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting alert {AlertId}", alertId);
                return StatusCode(500, new { message = "Failed to retrieve alert" });
            }
        }

        [HttpPut("{alertId}")]
        [ProducesResponseType(typeof(UserAlertResponseDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> UpdateAlert(int alertId, [FromBody] UpdateUserAlertDto dto)
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0)
                {
                    return Unauthorized(new { message = "Invalid user" });
                }

                var result = await _userAlertService.UpdateAlertAsync(userId, alertId, dto);
                if (result == null)
                {
                    return NotFound(new { message = "Alert not found" });
                }

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error updating alert {AlertId}", alertId);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating alert {AlertId}", alertId);
                return StatusCode(500, new { message = "Failed to update alert" });
            }
        }

        [HttpDelete("{alertId}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> DeleteAlert(int alertId)
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0)
                {
                    return Unauthorized(new { message = "Invalid user" });
                }

                var result = await _userAlertService.DeleteAlertAsync(userId, alertId);
                if (!result)
                {
                    return NotFound(new { message = "Alert not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting alert {AlertId}", alertId);
                return StatusCode(500, new { message = "Failed to delete alert" });
            }
        }

        [HttpGet("{alertId}/history")]
        [ProducesResponseType(typeof(List<UserAlertHistoryDto>), 200)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> GetAlertHistory(int alertId)
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0)
                {
                    return Unauthorized(new { message = "Invalid user" });
                }

                var results = await _userAlertService.GetAlertHistoryAsync(userId, alertId);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting history for alert {AlertId}", alertId);
                return StatusCode(500, new { message = "Failed to retrieve history" });
            }
        }

        [HttpGet("history")]
        [ProducesResponseType(typeof(List<UserAlertHistoryDto>), 200)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> GetUserHistory([FromQuery] int limit = 50)
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0)
                {
                    return Unauthorized(new { message = "Invalid user" });
                }

                var results = await _userAlertService.GetUserHistoryAsync(userId, limit);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user history");
                return StatusCode(500, new { message = "Failed to retrieve history" });
            }
        }
    }
}
