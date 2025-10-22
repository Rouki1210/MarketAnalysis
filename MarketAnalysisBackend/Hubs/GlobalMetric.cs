using MarketAnalysisBackend.Models;
using Microsoft.AspNetCore.SignalR;

namespace MarketAnalysisBackend.Hubs
{
    public class GlobalMetric : Hub
    {
        private readonly ILogger<GlobalMetric> _logger;
        public GlobalMetric(ILogger<GlobalMetric> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("Client connected to GlobalMetric hub: {ConnectionId}", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation($"❌ Client disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }

        // Hàm client có thể gọi để yêu cầu refresh data
        public async Task RequestGlobalMetrics()
        {
            _logger.LogInformation($"📩 Client {Context.ConnectionId} requested global metrics.");
            await Clients.Caller.SendAsync("ReceiveMessage", "Server is processing request...");
        }

        // Hàm server sẽ gọi để broadcast data
        public async Task SendGlobalMetrics(Global_metric metric)
        {
            await Clients.All.SendAsync("ReceiveGlobalMetrics", metric);
        }
    }
}
