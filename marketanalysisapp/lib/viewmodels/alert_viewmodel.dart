import 'package:flutter/foundation.dart';
import '../models/user_alert_model.dart';
import '../repositories/alert_repository.dart';

class AlertViewModel extends ChangeNotifier {
  final AlertRepository _repository;

  List<UserAlert> _alerts = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<UserAlert> get alerts => _alerts;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  AlertViewModel({AlertRepository? repository})
    : _repository = repository ?? AlertRepository();

  Future<void> loadAlerts() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _alerts = await _repository.getAlerts();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createAlert(CreateUserAlert alert) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      print('DEBUG: AlertViewModel - Creating alert...');
      final newAlert = await _repository.createAlert(alert);
      _alerts.add(newAlert);
      print('DEBUG: AlertViewModel - Alert created successfully');
      return true;
    } catch (e) {
      print('DEBUG: AlertViewModel - Error: $e');
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> updateAlert(int id, UpdateUserAlert alert) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final updatedAlert = await _repository.updateAlert(id, alert);
      final index = _alerts.indexWhere((a) => a.id == id);
      if (index != -1) {
        _alerts[index] = updatedAlert;
      }
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> deleteAlert(int id) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _repository.deleteAlert(id);
      _alerts.removeWhere((a) => a.id == id);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
