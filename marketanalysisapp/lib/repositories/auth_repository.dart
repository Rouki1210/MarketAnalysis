import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/user_model.dart';
import 'package:google_sign_in/google_sign_in.dart';

/// Repository for authentication operations
class AuthRepository {
  final ApiClient _apiClient;

  AuthRepository({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient();

  /// Login with email and password
  Future<AuthResponse> login(String usernameOrEmail, String password) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.login,
        body: {'usernameOrEmail': usernameOrEmail, 'password': password},
        includeAuth: false,
      );

      return AuthResponse.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Login failed: $e');
    }
  }

  /// Register new user
  Future<AuthResponse> register(String email, String password) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.register,
        body: {'email': email, 'password': password},
        includeAuth: false,
      );

      return AuthResponse.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Registration failed: $e');
    }
  }

  /// Google OAuth authentication
  Future<AuthResponse> loginWithGoogle() async {
    try {
      // Web Client ID from Google Cloud Console
      const String serverClientId =
          '461833316536-n82t423nm73mhtejkv957sergtsanvc2.apps.googleusercontent.com';

      const List<String> scopes = <String>['email', 'profile', 'openid'];

      // Initialize GoogleSignIn instance (v7.2.0 API)
      final GoogleSignIn signIn = GoogleSignIn.instance;

      await signIn.initialize(
        clientId: serverClientId,
        serverClientId: serverClientId,
      );

      // Authenticate the user
      final GoogleSignInAccount? googleUser = await signIn.authenticate();

      if (googleUser == null) {
        throw Exception('Google Sign-In cancelled by user');
      }

      // Request server auth code with explicit scopes
      final GoogleSignInServerAuthorization? serverAuth = await googleUser
          .authorizationClient
          .authorizeServer(scopes);

      if (serverAuth == null) {
        throw Exception('Failed to get server auth code from Google');
      }

      // Exchange code with backend
      return await googleAuth(serverAuth.serverAuthCode);
    } catch (e) {
      throw Exception('Google login failed: $e');
    }
  }

  /// Backend API call for Google OAuth
  Future<AuthResponse> googleAuth(String code) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.googleAuth,
        body: {'code': code},
        includeAuth: false,
      );

      return AuthResponse.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Google authentication failed: $e');
    }
  }

  /// Request nonce for wallet authentication
  Future<Map<String, dynamic>> requestWalletNonce(String walletAddress) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.walletRequestNonce,
        body: {'walletAddress': walletAddress},
        includeAuth: false,
      );

      return response as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Failed to request nonce: $e');
    }
  }

  /// Login with wallet signature
  Future<AuthResponse> walletLogin({
    required String walletAddress,
    required String signature,
    required String message,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.walletLogin,
        body: {
          'walletAddress': walletAddress,
          'signature': signature,
          'message': message,
        },
        includeAuth: false,
      );

      return AuthResponse.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Wallet login failed: $e');
    }
  }

  /// Get user information by token
  Future<User> getUserInfo(String token) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.userInfo(token),
        includeAuth: true,
      );

      final data = response as Map<String, dynamic>;
      if (data['success'] == true && data['user'] != null) {
        return User.fromJson(data['user'] as Map<String, dynamic>);
      }

      throw Exception('Failed to get user info');
    } catch (e) {
      throw Exception('Get user info failed: $e');
    }
  }

  /// Update user profile
  Future<User> updateProfile({
    String? displayName,
    String? bio,
    String? birthday,
    String? website,
  }) async {
    try {
      final body = <String, dynamic>{};
      if (displayName != null) body['displayName'] = displayName;
      if (bio != null) body['bio'] = bio;
      if (birthday != null) body['birthday'] = birthday;
      if (website != null) body['website'] = website;

      final response = await _apiClient.put(
        ApiEndpoints.updateProfile,
        body: body,
        includeAuth: true,
      );

      final data = response as Map<String, dynamic>;
      if (data['success'] == true && data['user'] != null) {
        return User.fromJson(data['user'] as Map<String, dynamic>);
      }

      throw Exception('Failed to update profile');
    } catch (e) {
      throw Exception('Update profile failed: $e');
    }
  }
}
