import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http/io_client.dart';
import '../storage/secure_storage.dart';
import '../../config/app_config.dart';

/// HTTP client wrapper with authentication and error handling
class ApiClient {
  late final http.Client _httpClient;
  final SecureStorageService _secureStorage;

  ApiClient({http.Client? httpClient, SecureStorageService? secureStorage})
    : _secureStorage = secureStorage ?? SecureStorageService() {
    _httpClient = httpClient ?? _createHttpClient();
  }

  /// Create HTTP client with SSL bypass for localhost
  static http.Client _createHttpClient() {
    final ioClient = HttpClient()
      ..badCertificateCallback = (X509Certificate cert, String host, int port) {
        // Allow self-signed certificates for localhost only
        return host == 'localhost' ||
            host == '127.0.0.1' ||
            host.contains('192.168.');
      };
    return IOClient(ioClient);
  }

  /// Get stored auth token
  Future<String?> getToken() async {
    return await _secureStorage.getToken();
  }

  /// Save auth token
  Future<void> saveToken(String token) async {
    await _secureStorage.saveToken(token);
  }

  /// Delete auth token
  Future<void> deleteToken() async {
    await _secureStorage.deleteToken();
  }

  /// Build headers with optional authentication
  Future<Map<String, String>> _buildHeaders({bool includeAuth = true}) async {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth) {
      final token = await getToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  /// GET request
  Future<dynamic> get(
    String endpoint, {
    Map<String, String>? queryParams,
    bool includeAuth = true,
  }) async {
    try {
      final uri = _buildUri(endpoint, queryParams);
      final headers = await _buildHeaders(includeAuth: includeAuth);

      final response = await _httpClient
          .get(uri, headers: headers)
          .timeout(Duration(milliseconds: AppConfig.apiTimeout));

      return _handleResponse(response);
    } on SocketException {
      throw ApiException('No internet connection');
    } on HttpException {
      throw ApiException('Service unavailable');
    } on FormatException {
      throw ApiException('Invalid response format');
    } on HandshakeException catch (e) {
      throw ApiException(
        'SSL Handshake failed: $e\n\nMake sure your backend is running on ${AppConfig.apiBaseUrl}',
      );
    } catch (e) {
      throw ApiException('Request failed: $e');
    }
  }

  /// POST request
  Future<dynamic> post(
    String endpoint, {
    Map<String, dynamic>? body,
    bool includeAuth = true,
  }) async {
    try {
      final uri = _buildUri(endpoint);
      final headers = await _buildHeaders(includeAuth: includeAuth);

      print('DEBUG: ApiClient POST - Endpoint: $endpoint');
      print('DEBUG: ApiClient POST - Full URI: $uri');
      print('DEBUG: ApiClient POST - Headers: ${headers.keys.join(", ")}');

      final response = await _httpClient
          .post(
            uri,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(Duration(milliseconds: AppConfig.apiTimeout));

      print('DEBUG: ApiClient POST - Response status: ${response.statusCode}');
      return _handleResponse(response);
    } on SocketException {
      throw ApiException('No internet connection');
    } on HttpException {
      throw ApiException('Service unavailable');
    } on FormatException {
      throw ApiException('Invalid response format');
    } on HandshakeException catch (e) {
      throw ApiException(
        'SSL Handshake failed: $e\n\nMake sure your backend is running on ${AppConfig.apiBaseUrl}',
      );
    } catch (e) {
      throw ApiException('Request failed: $e');
    }
  }

  /// PUT request
  Future<dynamic> put(
    String endpoint, {
    Map<String, dynamic>? body,
    bool includeAuth = true,
  }) async {
    try {
      final uri = _buildUri(endpoint);
      final headers = await _buildHeaders(includeAuth: includeAuth);

      final response = await _httpClient
          .put(
            uri,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(Duration(milliseconds: AppConfig.apiTimeout));

      return _handleResponse(response);
    } on SocketException {
      throw ApiException('No internet connection');
    } on HttpException {
      throw ApiException('Service unavailable');
    } on FormatException {
      throw ApiException('Invalid response format');
    } on HandshakeException catch (e) {
      throw ApiException(
        'SSL Handshake failed: $e\n\nMake sure your backend is running on ${AppConfig.apiBaseUrl}',
      );
    } catch (e) {
      throw ApiException('Request failed: $e');
    }
  }

  /// DELETE request
  Future<dynamic> delete(String endpoint, {bool includeAuth = true}) async {
    try {
      final uri = _buildUri(endpoint);
      final headers = await _buildHeaders(includeAuth: includeAuth);

      final response = await _httpClient
          .delete(uri, headers: headers)
          .timeout(Duration(milliseconds: AppConfig.apiTimeout));

      return _handleResponse(response);
    } on SocketException {
      throw ApiException('No internet connection');
    } on HttpException {
      throw ApiException('Service unavailable');
    } on FormatException {
      throw ApiException('Invalid response format');
    } on HandshakeException catch (e) {
      throw ApiException(
        'SSL Handshake failed: $e\n\nMake sure your backend is running on ${AppConfig.apiBaseUrl}',
      );
    } catch (e) {
      throw ApiException('Request failed: $e');
    }
  }

  /// Build URI from endpoint and query parameters
  Uri _buildUri(String endpoint, [Map<String, String>? queryParams]) {
    final url = '${AppConfig.apiBaseUrl}$endpoint';

    if (queryParams != null && queryParams.isNotEmpty) {
      return Uri.parse(url).replace(queryParameters: queryParams);
    }

    return Uri.parse(url);
  }

  /// Handle HTTP response
  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;

      try {
        return jsonDecode(response.body);
      } catch (e) {
        return response.body;
      }
    } else if (response.statusCode == 401) {
      throw UnauthorizedException('Unauthorized - please login again');
    } else if (response.statusCode == 403) {
      throw ForbiddenException('Access forbidden');
    } else if (response.statusCode == 404) {
      throw NotFoundException('Resource not found');
    } else if (response.statusCode >= 500) {
      throw ServerException('Server error: ${response.statusCode}');
    } else {
      throw ApiException(
        'Request failed with status: ${response.statusCode}\n${response.body}',
      );
    }
  }

  void dispose() {
    _httpClient.close();
  }
}

/// Base API exception
class ApiException implements Exception {
  final String message;
  ApiException(this.message);

  @override
  String toString() => message;
}

/// 401 Unauthorized
class UnauthorizedException extends ApiException {
  UnauthorizedException(super.message);
}

/// 403 Forbidden
class ForbiddenException extends ApiException {
  ForbiddenException(super.message);
}

/// 404 Not Found
class NotFoundException extends ApiException {
  NotFoundException(super.message);
}

/// 500+ Server errors
class ServerException extends ApiException {
  ServerException(super.message);
}
