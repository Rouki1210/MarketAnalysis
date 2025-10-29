using MarketAnalysisBackend.Hubs;
using MarketAnalysisBackend.Models.Alert;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using static MarketAnalysisBackend.Models.DTO.GlobalAlertDTO;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class NotificationService : INotificationService
    {
        private readonly ILogger<NotificationService> _logger;
        private readonly IGlobalAlertRepository _alertRepo;
        private readonly IHubContext<AlertHub> _hubContext;
        public NotificationService(ILogger<NotificationService> logger, IGlobalAlertRepository alertRepo, IHubContext<AlertHub> hubContext)
        {
            _logger = logger;
            _alertRepo = alertRepo;
            _hubContext = hubContext;
        }
        public async Task BroadcastAlertAsync(GlobalAlertEvent alertEvent, CancellationToken cancellationToken = default)
        {
            try
            {
                var notification = new GlobalAlertNotification
                {
                    Id = alertEvent.Id,
                    Type = "global_alert",
                    AssetSymbol = alertEvent.AssetSymbol,
                    Message = alertEvent.Message,
                    Severity = alertEvent.Severity,
                    EventType = alertEvent.EventType,
                    CurrentPrice = alertEvent.TriggerValue,
                    PercentChange = alertEvent.PercentChange,
                    TimeWindow = alertEvent.TimeWindow,
                    Timestamp = alertEvent.TriggeredAt
                };

                await _hubContext.Clients.All.SendAsync("ReceiveGlobalAlert", notification, cancellationToken);
                await _alertRepo.UpdateEventStatusAsync(alertEvent.Id, "Send", 1, cancellationToken);

                _logger.LogInformation("📡 Broadcasted alert ID={Id} to all clients", alertEvent.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to broadcast alert ID={Id}", alertEvent.Id);

                await _alertRepo.UpdateEventStatusAsync(alertEvent.Id, "FAILED", 0, cancellationToken);
            }
        }

        public Task<int> GetConnectedClientsCountAsync()
        {
            return Task.FromResult(0);
        }
    }
}
