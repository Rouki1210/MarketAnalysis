using Microsoft.AspNetCore.SignalR;

namespace MarketAnalysisBackend.Hubs
{
    public class AlertHub : Hub
    {
        private readonly ILogger<AlertHub> _logger;

        public AlertHub(ILogger<AlertHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("🟢 Client connected to AlertHub: {ConnectionId}", Context.ConnectionId);
            await Clients.Caller.SendAsync("Connected", new
            {
                message = "Connected to Global Alerts",
                connectionId = Context.ConnectionId,
                timestamp = DateTime.UtcNow
            });
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("🔴 Client disconnected from AlertHub: {ConnectionId}", Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        // Client có thể join vào nhóm để nhận alerts riêng
        public async Task JoinUserGroup(string userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            _logger.LogInformation("User {UserId} joined alert group", userId);
        }

        public async Task LeaveUserGroup(string userId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
        }
    }
}