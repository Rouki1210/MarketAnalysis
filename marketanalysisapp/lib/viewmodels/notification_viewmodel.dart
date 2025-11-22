import 'package:flutter/foundation.dart';
import '../models/notification_model.dart';
import '../repositories/notification_repository.dart';

class NotificationViewModel extends ChangeNotifier {
  final NotificationRepository _repository;

  List<AppNotification> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;
  String? _errorMessage;
  int _currentPage = 1;
  bool _hasMore = true;

  List<AppNotification> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get hasMore => _hasMore;

  NotificationViewModel({NotificationRepository? repository})
    : _repository = repository ?? NotificationRepository();

  Future<void> loadNotifications({bool refresh = false}) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _notifications = [];
    }

    if (!_hasMore && !refresh) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final newNotifications = await _repository.getNotifications(
        page: _currentPage,
        pageSize: 20,
      );

      if (newNotifications.isEmpty) {
        _hasMore = false;
      } else {
        _notifications.addAll(newNotifications);
        _currentPage++;
      }

      // Also update unread count
      await loadUnreadCount();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadUnreadCount() async {
    try {
      _unreadCount = await _repository.getUnreadCount();
      notifyListeners();
    } catch (e) {
      // Ignore errors for unread count
    }
  }

  Future<void> markAsRead(int id) async {
    try {
      final success = await _repository.markAsRead(id);
      if (success) {
        final index = _notifications.indexWhere((n) => n.id == id);
        if (index != -1) {
          // Create a new instance with isRead = true
          final old = _notifications[index];
          _notifications[index] = AppNotification(
            id: old.id,
            actorUser: old.actorUser,
            notificationType: old.notificationType,
            entityType: old.entityType,
            entityId: old.entityId,
            message: old.message,
            isRead: true,
            createdAt: old.createdAt,
          );

          if (_unreadCount > 0) {
            _unreadCount--;
          }
          notifyListeners();
        }
      }
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  Future<void> markAllAsRead() async {
    try {
      final success = await _repository.markAllAsRead();
      if (success) {
        _notifications = _notifications
            .map(
              (n) => AppNotification(
                id: n.id,
                actorUser: n.actorUser,
                notificationType: n.notificationType,
                entityType: n.entityType,
                entityId: n.entityId,
                message: n.message,
                isRead: true,
                createdAt: n.createdAt,
              ),
            )
            .toList();

        _unreadCount = 0;
        notifyListeners();
      }
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  Future<void> deleteNotification(int id) async {
    try {
      final success = await _repository.deleteNotification(id);
      if (success) {
        final notification = _notifications.firstWhere((n) => n.id == id);
        if (!notification.isRead && _unreadCount > 0) {
          _unreadCount--;
        }
        _notifications.removeWhere((n) => n.id == id);
        notifyListeners();
      }
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
  }
}
