using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace MarketAnalysisBackend.Hubs
{
    [Authorize]
    public class UserAlertHub : Hub
    {
        private readonly ILogger<UserAlertHub> _logger;

        public UserAlertHub(ILogger<UserAlertHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                // Add user vào group riêng của họ
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");

                _logger.LogInformation(
                    "User {UserId} connected to AlertHub. ConnectionId: {ConnectionId}",
                    userId, Context.ConnectionId);
            }

            await base.OnConnectedAsync();
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                _logger.LogInformation(
                    "User {UserId} disconnected from AlertHub. ConnectionId: {ConnectionId}",
                    userId, Context.ConnectionId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task Ping()
        {
            await Clients.Caller.SendAsync("Pong", DateTime.UtcNow);
        }

        public async Task GetUnreadCount()
        {
            await Clients.Caller.SendAsync("UnreadCount", 0);
        }

        public async Task SendUnreadCountToUser(string userId, int count)
        {
            await Clients.Group($"user_{userId}").SendAsync("UnreadCount", count);
        }
    }

    public class AlertNotificationDto
    {
        public int Id { get; set; }
        public string AssetSymbol { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public decimal TargetPrice { get; set; }
        public decimal ActualPrice { get; set; }
        public string AlertType { get; set; } = string.Empty;
        public DateTime TriggeredAt { get; set; }
    }
}