using MarketAnalysisBackend.Hubs;
using MarketAnalysisBackend.Models.Community;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Interfaces.Community;
using MarketAnalysisBackend.Services.Interfaces.Community;
using Microsoft.AspNetCore.SignalR;

namespace MarketAnalysisBackend.Services.Implementations.Community
{
    public class CommunityNotificationService : ICommunityNotificationService
    {
        private readonly ICommunityNotificationRepository _notificationRepository;
        private readonly IHubContext<NotificationHub> _hubContext;
        public CommunityNotificationService(ICommunityNotificationRepository notificationRepository, IHubContext<NotificationHub> hubContext)
        {
            _notificationRepository = notificationRepository;
            _hubContext = hubContext;
        }
        public async Task<bool> DeleteNotificationAsync(int notificationId, int userId)
        {
            var notification = await _notificationRepository.GetByIdAsync(notificationId);
            if (notification == null || notification.UserId != userId)
                return false;
            return await _notificationRepository.DeleteAsync(notificationId);
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _notificationRepository.GetUnreadCountAsync(userId);
        }

        public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, int page = 1, int pageSize = 20)
        {
            var notifications = await _notificationRepository.GetUserNotificationsAsync(userId, page, pageSize);

            return notifications.Select(n => new NotificationDto
            {
                Id = n.Id,
                ActorUser = n.ActorUser != null ? new UserBasicDto
                {
                    Id = n.ActorUser.Id,
                    Username = n.ActorUser.Username,
                    DisplayName = n.ActorUser.DisplayName,
                    AvatarEmoji = n.ActorUser.AvartarUrl,
                    IsVerified = n.ActorUser.IsVerified
                } : null,
                NotificationType = n.NotificationType,
                EntityType = n.EntityType,
                EntityId = n.EntityId,
                Message = n.Message,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            }).ToList();
        }

        public async Task<bool> MarkAllAsReadAsync(int userId)
        {
            return await _notificationRepository.MarkAllAsReadAsync(userId);
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, int userId)
        {
            var notification = await _notificationRepository.GetByIdAsync(notificationId);
            if (notification == null || notification.UserId != userId)
                return false;

            return await _notificationRepository.MarkAsReadAsync(notificationId);
        }

        public async Task NotifyUserAsync(int userId, int? actorUserId, string notificationType, string entityType, int entityId, string message)
        {
            var notification = new CommunityNotification
            {
                UserId = userId,
                ActorUserId = actorUserId,
                NotificationType = notificationType,
                EntityType = entityType,
                EntityId = entityId,
                Message = message
            };

            var createdNotification = await _notificationRepository.CreateAsync(notification);
            var fullNotification = await _notificationRepository.GetByIdAsync(createdNotification.Id);

            if (fullNotification != null)
            {
                var notificationDto = new NotificationDto
                {
                    Id = fullNotification.Id,
                    ActorUser = fullNotification.ActorUser != null ? new UserBasicDto
                    {
                        Id = fullNotification.ActorUser.Id,
                        Username = fullNotification.ActorUser.Username,
                        DisplayName = fullNotification.ActorUser.DisplayName,
                        AvatarEmoji = fullNotification.ActorUser.AvartarUrl,
                        IsVerified = fullNotification.ActorUser.IsVerified
                    } : null,
                    NotificationType = fullNotification.NotificationType,
                    EntityType = fullNotification.EntityType,
                    EntityId = fullNotification.EntityId,
                    Message = fullNotification.Message,
                    IsRead = fullNotification.IsRead,
                    CreatedAt = fullNotification.CreatedAt
                };

                // Send real-time notification via SignalR
                await _hubContext.Clients.Group($"user_{userId}")
                    .SendAsync("ReceiveNotification", notificationDto);
            }
        }
    }
}
