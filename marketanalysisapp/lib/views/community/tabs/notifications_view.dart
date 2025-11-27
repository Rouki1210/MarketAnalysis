import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../viewmodels/community_viewmodel.dart';

class NotificationsView extends StatefulWidget {
  const NotificationsView({super.key});

  @override
  State<NotificationsView> createState() => _NotificationsViewState();
}

class _NotificationsViewState extends State<NotificationsView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CommunityViewModel>().loadNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CommunityViewModel>(
      builder: (context, viewModel, child) {
        if (viewModel.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        if (viewModel.notifications.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Icon(
                      Icons.notifications,
                      size: 64,
                      color: Colors.amber.withValues(alpha: 0.5),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: const BoxDecoration(
                          color: Colors.black,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.block,
                          size: 24,
                          color: Colors.red,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Text(
                  'No notifications',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  "You're all caught up!",
                  style: TextStyle(fontSize: 14, color: AppColors.textTertiary),
                ),
              ],
            ),
          );
        }

        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: viewModel.notifications.length,
          separatorBuilder: (context, index) =>
              const Divider(color: AppColors.border),
          itemBuilder: (context, index) {
            final notification = viewModel.notifications[index];
            final isRead = notification['isRead'] ?? false;

            return ListTile(
              contentPadding: EdgeInsets.zero,
              leading: CircleAvatar(
                backgroundColor: AppColors.primaryAccent.withValues(alpha: 0.2),
                child: Icon(
                  _getIconForType(notification['notificationType']),
                  color: AppColors.primaryAccent,
                  size: 20,
                ),
              ),
              title: Text(
                notification['message'] ?? '',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                ),
              ),
              subtitle: Text(
                _formatDate(notification['createdAt']),
                style: TextStyle(color: AppColors.textTertiary, fontSize: 12),
              ),
              trailing: !isRead
                  ? Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: AppColors.primaryAccent,
                        shape: BoxShape.circle,
                      ),
                    )
                  : null,
              onTap: () {
                if (!isRead) {
                  viewModel.markNotificationAsRead(notification['id']);
                }
                // Navigate to related entity if needed
              },
            );
          },
        );
      },
    );
  }

  IconData _getIconForType(String? type) {
    switch (type) {
      case 'Like':
        return Icons.favorite;
      case 'Comment':
        return Icons.comment;
      case 'Follow':
        return Icons.person_add;
      default:
        return Icons.notifications;
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final date = DateTime.parse(dateStr);
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inDays > 0) {
        return '${difference.inDays}d ago';
      } else if (difference.inHours > 0) {
        return '${difference.inHours}h ago';
      } else if (difference.inMinutes > 0) {
        return '${difference.inMinutes}m ago';
      } else {
        return 'Just now';
      }
    } catch (e) {
      return '';
    }
  }
}
