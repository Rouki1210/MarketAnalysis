using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Hubs;
using MarketAnalysisBackend.Models.Alert;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class UserAlertService : IUserAlertService
    {
        private readonly IUserAlertRepository _alertRepository;
        private readonly IUserAlertHistoryRepository _historyRepository;
        private readonly AppDbContext _context;
        private readonly ILogger<UserAlertService> _logger;
        private readonly IHubContext<UserAlertHub> _hubContext;

        private const int MAX_ALERTS_PER_USER = 50;
        private const decimal REACHES_THRESHOLD_PERCENT = 0.1m;
        private const int COOLDOWN_MINUTES = 5;
        public UserAlertService(
            IUserAlertRepository alertRepository,
            IUserAlertHistoryRepository historyRepository,
            AppDbContext context,
            ILogger<UserAlertService> logger,
            IHubContext<UserAlertHub> hubContext)
        {
            _alertRepository = alertRepository;
            _historyRepository = historyRepository;
            _context = context;
            _logger = logger;
            _hubContext = hubContext;
        }

        public async Task<UserAlertResponseDto> CreateAlertAsync(int userId, CreateUserAlertDto dto)
        {
            try
            {
                var userAlertCount = await _alertRepository.CountByUserIdAsync(userId);
                if(userAlertCount >= MAX_ALERTS_PER_USER)
                {
                    throw new InvalidOperationException($"Maximum alert limit of {MAX_ALERTS_PER_USER} reached");
                }

                var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
                if (!userExists)
                {
                    throw new ArgumentException("User not found");
                }

                var asset = await _context.Assets.FindAsync(dto.AssetId);
                if (asset == null)
                {
                    throw new ArgumentException("Asset not found");
                }

                // Validate alert type
                var validTypes = new[] { "REACHES", "ABOVE", "BELOW" };
                if (!validTypes.Contains(dto.AlertType.ToUpper()))
                {
                    throw new ArgumentException("Alert type must be REACHES, ABOVE, or BELOW");
                }

                // Create alert
                var alert = new UserAlert
                {
                    UserId = userId,
                    AssetId = dto.AssetId,
                    AssetSymbol = asset.Symbol,
                    AlertType = dto.AlertType.ToUpper(),
                    TargetPrice = dto.TargetPrice,
                    IsRepeating = dto.IsRepeating,
                    Note = dto.Note ?? string.Empty,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    LastTriggedAt = DateTime.UtcNow.AddDays(-1), // Avoids MinValue issues and Cooldown
                    LastPriceCheckAt = DateTime.UtcNow.AddDays(-1),
                    TriggerCount = 0
                };

                await _alertRepository.AddAsync(alert);
                await _alertRepository.SaveChangesAsync();

                _logger.LogInformation(
                    "Alert created: User {UserId}, Asset {AssetSymbol}, Type {AlertType}, Target {TargetPrice}",
                    userId, asset.Symbol, dto.AlertType, dto.TargetPrice);

                // Reload with asset
                var createdAlert = await _alertRepository.GetByIdWithAssetAsync(alert.Id);
                return MapToDto(createdAlert!);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating alert for user {UserId}", userId);
                throw;
            }
        }

        public async Task<UserAlertResponseDto?> GetAlertByIdAsync(int userId, int alertId)
        {
            var alert = await _alertRepository.GetByIdWithAssetAsync(alertId);
            if (alert == null || alert.UserId != userId)
            {
                return null;
            }

            return MapToDto(alert);
        }

        public async Task<List<UserAlertResponseDto>> GetUserAlertsAsync(int userId)
        {
            try
            {
                var alerts = await _alertRepository.GetByUserIdAsync(userId);
                return alerts.Select(MapToDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting alerts for user {UserId}", userId);
                throw;
            }
        }

        public async Task<UserAlertResponseDto?> UpdateAlertAsync(int userId, int alertId, UpdateUserAlertDto dto)
        {
            try
            {
                var alert = await _alertRepository.GetByIdWithAssetAsync(alertId);

                if (alert == null || alert.UserId != userId)
                {
                    return null;
                }

                // Update fields if provided
                if (dto.TargetPrice.HasValue)
                {
                    if (dto.TargetPrice.Value <= 0)
                    {
                        throw new ArgumentException("Target price must be greater than 0");
                    }
                    alert.TargetPrice = dto.TargetPrice.Value;
                }

                if (dto.IsRepeating.HasValue)
                {
                    alert.IsRepeating = dto.IsRepeating.Value;
                }

                if (dto.IsActive.HasValue)
                {
                    alert.IsActive = dto.IsActive.Value;
                }

                if (dto.Note != null)
                {
                    alert.Note = dto.Note;
                }

                await _alertRepository.UpdateAsync(alert);

                _logger.LogInformation("Alert {AlertId} updated by user {UserId}", alertId, userId);

                return MapToDto(alert);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating alert {AlertId} for user {UserId}", alertId, userId);
                throw;
            }
        }

        public async Task<bool> DeleteAlertAsync(int userId, int alertId)
        {
            try
            {
                var isOwned = await _alertRepository.IsOwnedByUserAsync(alertId, userId);
                if (!isOwned)
                {
                    return false;
                }

                var alert = await _alertRepository.GetByIdAsync(alertId);
                if (alert == null)
                {
                    return false;
                }

                await _alertRepository.DeleteAsync(alert);

                _logger.LogInformation("Alert {AlertId} deleted by user {UserId}", alertId, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting alert {AlertId} for user {UserId}", alertId, userId);
                throw;
            }
        }

        public async Task<List<UserAlertHistoryDto>> GetAlertHistoryAsync(int userId, int alertId)
        {
            try
            {
                // Verify user owns the alert
                var isOwned = await _alertRepository.IsOwnedByUserAsync(alertId, userId);
                if (!isOwned)
                {
                    return new List<UserAlertHistoryDto>();
                }

                var history = await _historyRepository.GetByAlertIdAsync(alertId);

                return history.Select(h => new UserAlertHistoryDto
                {
                    Id = h.Id,
                    UserAlertId = h.UserAlertId,
                    AssetSymbol = h.AssetSymbol,
                    AssetName = h.Asset?.Name ?? "",
                    AlertType = h.AlertType,
                    TargetPrice = h.TargetPrice,
                    ActualPrice = h.ActualPrice,
                    TriggeredAt = h.TriggeredAt,
                    WasNotified = h.WasNotified,
                    ViewedAt = h.ViewAt,
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting history for alert {AlertId}", alertId);
                throw;
            }
        }

        public async Task<List<UserAlertHistoryDto>> GetUserHistoryAsync(int userId, int limit = 50)
        {
            try
            {
                var history = await _historyRepository.GetByUserIdAsync(userId, limit);

                return history.Select(h => new UserAlertHistoryDto
                {
                    Id = h.Id,
                    UserAlertId = h.UserAlertId,
                    AssetSymbol = h.AssetSymbol,
                    AssetName = h.Asset?.Name ?? "",
                    AlertType = h.AlertType,
                    TargetPrice = h.TargetPrice,
                    ActualPrice = h.ActualPrice,
                    TriggeredAt = h.TriggeredAt,
                    WasNotified = h.WasNotified,
                    ViewedAt = h.ViewAt
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting history for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> DeleteAlertHistoryAsync(int userId, int historyId)
        {
            try
            {
                var history = await _historyRepository.GetByIdAsync(historyId);
                
                if (history == null)
                {
                    return false;
                }

                // Verify the history belongs to this user
                var userAlert = await _alertRepository.GetByIdAsync(history.UserAlertId);
                if (userAlert == null || userAlert.UserId != userId)
                {
                    return false;
                }

                await _historyRepository.DeleteAsync(history);
                await _historyRepository.SaveChangesAsync(); // CRITICAL: Save to database!
                
                _logger.LogInformation("Deleted alert history {HistoryId} for user {UserId}", historyId, userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting alert history {HistoryId} for user {UserId}", historyId, userId);
                throw;
            }
        }

        public async Task CheckAndTriggerAlertsAsync()
        {
            try
            {
                var activeAlerts = await _alertRepository.GetActiveAlertsAsync();

                if (!activeAlerts.Any())
                {
                    _logger.LogDebug("No active alerts to check");
                    return;
                }

                // Group alerts by asset for efficiency
                var alertsByAsset = activeAlerts.GroupBy(a => a.AssetId);

                foreach (var assetGroup in alertsByAsset)
                {
                    var assetId = assetGroup.Key;

                    // Get current price from PriceCache
                    var priceCache = await _context.PriceCaches
                        .FirstOrDefaultAsync(pc => pc.AssetId == assetId);

                    if (priceCache == null)
                    {
                        _logger.LogWarning("No price cache found for asset {AssetId}", assetId);
                        continue;
                    }

                    var currentPrice = priceCache.CurrentPrice;

                    // Check each alert for this asset
                    foreach (var alert in assetGroup)
                    {
                        await CheckAndTriggerAlert(alert, currentPrice);
                    }
                }

                await _alertRepository.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking and triggering alerts");
                throw;
            }
        }

        private async Task CheckAndTriggerAlert(UserAlert alert, decimal currentPrice)
        {
            // Check cooldown
            if (alert.LastTriggedAt != default &&
                (DateTime.UtcNow - alert.LastTriggedAt).TotalMinutes < COOLDOWN_MINUTES)
            {
                return;
            }

            bool shouldTrigger = false;

            switch (alert.AlertType.ToUpper())
            {
                case "REACHES":
                    // Trigger if price is within 0.1% of target
                    var percentDiff = Math.Abs((currentPrice - alert.TargetPrice) / alert.TargetPrice * 100);
                    shouldTrigger = percentDiff <= REACHES_THRESHOLD_PERCENT;
                    break;

                case "ABOVE":
                    // Trigger if price crosses above target
                    shouldTrigger = currentPrice >= alert.TargetPrice &&
                                  (!alert.LastKnownPrice.HasValue || alert.LastKnownPrice.Value < alert.TargetPrice);
                    break;

                case "BELOW":
                    // Trigger if price crosses below target
                    shouldTrigger = currentPrice <= alert.TargetPrice &&
                                  (!alert.LastKnownPrice.HasValue || alert.LastKnownPrice.Value > alert.TargetPrice);
                    break;
            }

            // Update last known price
            alert.LastKnownPrice = currentPrice;
            alert.LastPriceCheckAt = DateTime.UtcNow;

            if (shouldTrigger)
            {
                await TriggerAlert(alert, currentPrice);
            }
        }

        private async Task TriggerAlert(UserAlert alert, decimal actualPrice)
        {
            // Create history record
            var history = new UserAlertHistories
            {
                UserAlertId = alert.Id,
                UserId = alert.UserId,
                AssetId = alert.AssetId,
                AssetSymbol = alert.AssetSymbol,
                AlertType = alert.AlertType,
                TargetPrice = alert.TargetPrice,
                ActualPrice = actualPrice,
                PriceDifference = ((actualPrice - alert.TargetPrice) / alert.TargetPrice) * 100,
                TriggeredAt = DateTime.UtcNow,
                WasNotified = false,
                NotificationMethod = "PENDING"
            };

            await _historyRepository.AddAsync(history);

            // Update alert
            alert.LastTriggedAt = DateTime.UtcNow;
            alert.TriggerCount++;

            // Deactivate if not repeating
            if (!alert.IsRepeating)
            {
                alert.IsActive = false;
            }

            _logger.LogInformation(
                "Alert {AlertId} triggered for user {UserId}. Asset: {Symbol}, Target: {Target}, Actual: {Actual}",
                alert.Id, alert.UserId, alert.AssetSymbol, alert.TargetPrice, actualPrice);

            // Send SignalR notification
            try
            {
                var asset = await _context.Assets.FindAsync(alert.AssetId);
                var assetName = asset?.Name ?? alert.AssetSymbol;

                await _hubContext.Clients.Group($"user_{alert.UserId}")
                    .SendAsync("ReceiveAlert", new
                    {
                        id = history.Id,
                        assetSymbol = alert.AssetSymbol,
                        assetName = assetName,
                        targetPrice = alert.TargetPrice,
                        actualPrice = actualPrice,
                        alertType = alert.AlertType,
                        triggeredAt = history.TriggeredAt,
                        priceDifference = history.PriceDifference
                    });

                // Update notification status
                history.WasNotified = true;
                history.NotificationMethod = "SIGNALR";
                await _historyRepository.UpdateAsync(history);

                _logger.LogInformation(
                    "📤 SignalR notification sent for alert {AlertId} to user_{UserId}",
                    alert.Id, alert.UserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send SignalR notification for alert {AlertId}", alert.Id);
                history.NotificationMethod = "FAILED";
                history.NotificationError = ex.Message;
            }
        }

        private UserAlertResponseDto MapToDto(UserAlert alert)
        {
            return new UserAlertResponseDto
            {
                Id = alert.Id,
                UserId = alert.UserId,
                AssetId = alert.AssetId,
                AssetSymbol = alert.AssetSymbol,
                AssetName = alert.Asset?.Name ?? "",
                AlertType = alert.AlertType,
                TargetPrice = alert.TargetPrice,
                IsRepeating = alert.IsRepeating,
                Note = alert.Note,
                IsActive = alert.IsActive,
                CreatedAt = alert.CreatedAt,
                LastTriggeredAt = alert.LastTriggedAt,
                TriggerCount = alert.TriggerCount
            };
        }
    }
}
