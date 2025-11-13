using MarketAnalysisBackend.Models.Community;

namespace MarketAnalysisBackend.Repositories.Interfaces.Community
{
    public interface ICommunityNotificationRepository
    {
        Task<CommunityNotification?> GetByIdAsync(int id);
        Task<List<CommunityNotification>> GetUserNotificationsAsync(int userId, int page = 1, int pageSize = 20);
        Task<List<CommunityNotification>> GetUnreadNotificationsAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task<CommunityNotification> CreateAsync(CommunityNotification notification);
        Task<bool> MarkAsReadAsync(int id);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task<bool> DeleteAsync(int id);
    }
}
