using MarketAnalysisBackend.Models.DTO;

namespace MarketAnalysisBackend.Services.Interfaces.Community
{
    public interface ICommunityNotification
    {
        Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, int page = 1, int pageSize = 20);
        Task<int> GetUnreadCountAsync(int userId);
        Task<bool> MarkAsReadAsync(int notificationId, int userId);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task<bool> DeleteNotificationAsync(int notificationId, int userId);
        Task NotifyUserAsync(int userId, int? actorUserId, string notificationType, string entityType, int entityId, string message);
    }
}
