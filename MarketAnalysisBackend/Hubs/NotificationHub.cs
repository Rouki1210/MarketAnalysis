using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace MarketAnalysisBackend.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly ILogger<NotificationHub> _logger;
        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }
        public override async Task OnConnectedAsync()
        {
            var userId = GetUserId();

            if (userId.HasValue)
            {
                // Add user to their personal group for targeted notifications
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId.Value}");

                _logger.LogInformation(
                    "User {UserId} connected to NotificationHub with connection {ConnectionId}",
                    userId.Value, Context.ConnectionId);
            }
            else
            {
                _logger.LogWarning(
                    "Connection {ConnectionId} attempted to connect without valid user ID",
                    Context.ConnectionId);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetUserId();

            if (userId.HasValue)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId.Value}");

                _logger.LogInformation(
                    "User {UserId} disconnected from NotificationHub with connection {ConnectionId}",
                    userId.Value, Context.ConnectionId);
            }

            if (exception != null)
            {
                _logger.LogError(exception, "Error during disconnection for connection {ConnectionId}",
                    Context.ConnectionId);
            }

            await base.OnDisconnectedAsync(exception);
        }
        
        private int? GetUserId()
        {
            var userIdClaim = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

    }
}
