import 'package:flutter/foundation.dart';
import '../models/price_alert_notification_model.dart';
import '../repositories/notification_repository.dart';

class NotificationViewModel extends ChangeNotifier {
  final NotificationRepository _repository;

  List<PriceAlertNotification> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;
  String? _errorMessage;

  List<PriceAlertNotification> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  NotificationViewModel({NotificationRepository? repository})
    : _repository = repository ?? NotificationRepository();

  Future<void> loadNotifications({bool refresh = false}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final newNotifications = await _repository.getNotifications();
      _notifications = newNotifications;

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
        // Locally update the notification's viewedAt
        final index = _notifications.indexWhere((n) => n.id == id);
        if (index != -1) {
          final old = _notifications[index];
          // Create a new instance with viewedAt set to now
          _notifications[index] = PriceAlertNotification(
            id: old.id,
            userAlertId: old.userAlertId,
            assetSymbol: old.assetSymbol,
            assetName: old.assetName,
            alertType: old.alertType,
            targetPrice: old.targetPrice,
            actualPrice: old.actualPrice,
            triggeredAt: old.triggeredAt,
            wasNotified: old.wasNotified,
            viewedAt: DateTime.now(),
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
              (n) => PriceAlertNotification(
                id: n.id,
                userAlertId: n.userAlertId,
                assetSymbol: n.assetSymbol,
                assetName: n.assetName,
                alertType: n.alertType,
                targetPrice: n.targetPrice,
                actualPrice: n.actualPrice,
                triggeredAt: n.triggeredAt,
                wasNotified: n.wasNotified,
                viewedAt: DateTime.now(),
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
      print('DEBUG ViewModel: Attempting to delete notification $id');

      final success = await _repository.deleteNotification(id);
      print('DEBUG ViewModel: Delete API returned success = $success');

      if (success) {
        // Find and remove the notification
        final index = _notifications.indexWhere((n) => n.id == id);
        if (index != -1) {
          final notification = _notifications[index];
          if (!notification.isViewed && _unreadCount > 0) {
            _unreadCount--;
          }
          _notifications.removeAt(index);
          print('DEBUG ViewModel: Removed notification at index $index');
          notifyListeners();
        } else {
          print('DEBUG ViewModel: Notification $id not found in local list');
        }
      } else {
        print('DEBUG ViewModel: Delete API returned false');
        _errorMessage = 'Failed to delete notification';
        notifyListeners();
      }
    } catch (e) {
      print('DEBUG ViewModel: Error deleting notification: $e');
      _errorMessage = e.toString();
      notifyListeners();
    }
  }
}
