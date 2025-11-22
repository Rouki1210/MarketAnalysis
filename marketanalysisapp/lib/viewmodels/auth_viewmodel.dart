import 'package:flutter/foundation.dart';
import '../core/storage/secure_storage.dart';
import '../models/user_model.dart';
import '../repositories/auth_repository.dart';

/// Authentication state enum
enum AuthState { initial, loading, authenticated, unauthenticated, error }

/// Authentication ViewModel
class AuthViewModel extends ChangeNotifier {
  final AuthRepository _authRepository;
  final SecureStorageService _storage;

  AuthViewModel({AuthRepository? authRepository, SecureStorageService? storage})
    : _authRepository = authRepository ?? AuthRepository(),
      _storage = storage ?? SecureStorageService() {
    _checkAuthStatus();
  }

  // State
  AuthState _state = AuthState.initial;
  User? _currentUser;
  String? _errorMessage;

  // Getters
  AuthState get state => _state;
  User? get currentUser => _currentUser;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _state == AuthState.authenticated;
  bool get isLoading => _state == AuthState.loading;

  /// Check if user is already logged in
  Future<void> _checkAuthStatus() async {
    try {
      final isLoggedIn = await _storage.isLoggedIn();
      if (isLoggedIn) {
        final token = await _storage.getToken();
        if (token != null) {
          final user = await _authRepository.getUserInfo(token);
          _currentUser = user;
          // Ensure userId is saved
          await _storage.saveUserId(user.id.toString());
          _state = AuthState.authenticated;
          notifyListeners();
        }
      } else {
        _state = AuthState.unauthenticated;
        notifyListeners();
      }
    } catch (e) {
      _state = AuthState.unauthenticated;
      notifyListeners();
    }
  }

  /// Login with email and password
  Future<bool> login(String usernameOrEmail, String password) async {
    try {
      _state = AuthState.loading;
      _errorMessage = null;
      notifyListeners();

      final authResponse = await _authRepository.login(
        usernameOrEmail,
        password,
      );

      // Save token
      await _storage.saveToken(authResponse.token);

      // Handle user data
      if (authResponse.user != null) {
        await _storage.saveUserEmail(authResponse.user!.email);
        await _storage.saveUserId(authResponse.user!.id.toString());
        _currentUser = authResponse.user;
      } else {
        // Fetch user info if not returned in login response
        final user = await _authRepository.getUserInfo(authResponse.token);
        await _storage.saveUserEmail(user.email);
        await _storage.saveUserId(user.id.toString());
        _currentUser = user;
      }

      _state = AuthState.authenticated;
      notifyListeners();
      return true;
    } catch (e) {
      _state = AuthState.error;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Register new user
  Future<bool> register(String email, String password) async {
    try {
      _state = AuthState.loading;
      _errorMessage = null;
      notifyListeners();

      final authResponse = await _authRepository.register(email, password);

      // Save token
      await _storage.saveToken(authResponse.token);

      // Handle user data
      if (authResponse.user != null) {
        await _storage.saveUserEmail(authResponse.user!.email);
        await _storage.saveUserId(authResponse.user!.id.toString());
        _currentUser = authResponse.user;
      } else {
        // Fetch user info if not returned in register response
        final user = await _authRepository.getUserInfo(authResponse.token);
        await _storage.saveUserEmail(user.email);
        await _storage.saveUserId(user.id.toString());
        _currentUser = user;
      }

      _state = AuthState.authenticated;
      notifyListeners();
      return true;
    } catch (e) {
      _state = AuthState.error;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Google OAuth authentication
  Future<bool> loginWithGoogle() async {
    try {
      _state = AuthState.loading;
      _errorMessage = null;
      notifyListeners();

      final authResponse = await _authRepository.loginWithGoogle();

      // Save token and user data
      await _storage.saveToken(authResponse.token);
      if (authResponse.user != null) {
        await _storage.saveUserEmail(authResponse.user!.email);
        await _storage.saveUserId(authResponse.user!.id.toString());
        _currentUser = authResponse.user;
      }

      _state = AuthState.authenticated;
      notifyListeners();
      return true;
    } catch (e) {
      _state = AuthState.error;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Update user profile
  Future<bool> updateProfile({
    String? displayName,
    String? bio,
    String? birthday,
    String? website,
  }) async {
    try {
      final updatedUser = await _authRepository.updateProfile(
        displayName: displayName,
        bio: bio,
        birthday: birthday,
        website: website,
      );

      _currentUser = updatedUser;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    await _storage.clearAll();
    _currentUser = null;
    _state = AuthState.unauthenticated;
    _errorMessage = null;
    notifyListeners();
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
