import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../models/notification_model.dart';
import '../../viewmodels/notification_viewmodel.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationViewModel>().loadNotifications(refresh: true);
    });
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      final viewModel = context.read<NotificationViewModel>();
      if (!viewModel.isLoading && viewModel.hasMore) {
        viewModel.loadNotifications();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            tooltip: 'Mark all as read',
            onPressed: () {
              context.read<NotificationViewModel>().markAllAsRead();
            },
          ),
        ],
      ),
      body: Consumer<NotificationViewModel>(
        builder: (context, viewModel, child) {
          if (viewModel.isLoading && viewModel.notifications.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (viewModel.errorMessage != null &&
              viewModel.notifications.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Error loading notifications',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () => viewModel.loadNotifications(refresh: true),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (viewModel.notifications.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.notifications_off_outlined,
                    size: 64,
                    color: AppColors.textSecondary.withValues(alpha: 0.5),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No notifications',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => viewModel.loadNotifications(refresh: true),
            child: ListView.separated(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount:
                  viewModel.notifications.length + (viewModel.hasMore ? 1 : 0),
              separatorBuilder: (context, index) => const Divider(),
              itemBuilder: (context, index) {
                if (index == viewModel.notifications.length) {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: CircularProgressIndicator(),
                    ),
                  );
                }

                final notification = viewModel.notifications[index];
                return _buildNotificationItem(context, notification, viewModel);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildNotificationItem(
    BuildContext context,
    AppNotification notification,
    NotificationViewModel viewModel,
  ) {
    return Dismissible(
      key: Key('notification_${notification.id}'),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: AppColors.error,
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      onDismissed: (direction) {
        viewModel.deleteNotification(notification.id);
      },
      child: InkWell(
        onTap: () {
          if (!notification.isRead) {
            viewModel.markAsRead(notification.id);
          }
          // TODO: Navigate to related entity (Post, User, etc.)
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
          decoration: BoxDecoration(
            color: notification.isRead
                ? Colors.transparent
                : AppColors.primaryAccent.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar
              CircleAvatar(
                radius: 20,
                backgroundColor: AppColors.cardBackground,
                child: Text(
                  notification.actorUser?.avatarEmoji ?? '👤',
                  style: const TextStyle(fontSize: 20),
                ),
              ),
              const SizedBox(width: 12),

              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    RichText(
                      text: TextSpan(
                        style: Theme.of(context).textTheme.bodyMedium,
                        children: [
                          TextSpan(
                            text:
                                notification.actorUser?.displayName ??
                                'Someone',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          TextSpan(text: ' ${notification.message}'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatTimeAgo(notification.createdAt),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              if (!notification.isRead)
                const Center(
                  child: Icon(
                    Icons.circle,
                    size: 8,
                    color: AppColors.primaryAccent,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatTimeAgo(DateTime date) {
    final difference = DateTime.now().difference(date);
    if (difference.inDays > 365) {
      return '${(difference.inDays / 365).floor()}y ago';
    } else if (difference.inDays > 30) {
      return '${(difference.inDays / 30).floor()}mo ago';
    } else if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}
