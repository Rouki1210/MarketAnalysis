using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models.Community;
using MarketAnalysisBackend.Repositories.Interfaces.Community;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations.Community
{
    public class CommunityNotificationRepository : ICommunityNotificationRepository
    {
        private readonly AppDbContext _context;
        public CommunityNotificationRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<CommunityNotification> CreateAsync(CommunityNotification notification)
        {
            notification.CreatedAt = DateTime.UtcNow;
            notification.IsRead = false;

            await _context.communityNotifications.AddAsync(notification);
            await _context.SaveChangesAsync();

            return notification;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var notification = await _context.communityNotifications.FindAsync(id);
            if (notification == null)
                return false;

            _context.communityNotifications.Remove(notification);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<CommunityNotification?> GetByIdAsync(int id)
        {
            return await _context.communityNotifications
                .Include(n => n.ActorUser)
                .FirstOrDefaultAsync(n => n.Id == id);
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _context.communityNotifications
                .CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        public async Task<List<CommunityNotification>> GetUnreadNotificationsAsync(int userId)
        {
            return await _context.communityNotifications
                .Include(n => n.ActorUser)
                .Where(n => n.UserId == userId && !n.IsRead)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<CommunityNotification>> GetUserNotificationsAsync(int userId, int page = 1, int pageSize = 20)
        {
            return await _context.communityNotifications
                .Include(n => n.ActorUser)
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<bool> MarkAllAsReadAsync(int userId)
        {
            var notifications = await _context.communityNotifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach(var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkAsReadAsync(int id)
        {
            var notification = await _context.communityNotifications.FindAsync(id); 
            if (notification == null)
                return false;

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
