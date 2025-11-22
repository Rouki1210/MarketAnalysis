import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/community_model.dart';

/// Repository for community features
class CommunityRepository {
  final ApiClient _apiClient;

  CommunityRepository({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient();

  /// Get community posts (with pagination)
  Future<List<CommunityPost>> getPosts({
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.communityPosts,
        queryParams: {'page': page.toString(), 'pageSize': pageSize.toString()},
        includeAuth: false,
      );

      // Handle ApiResponse structure
      // Expected: { "success": true, "data": { "data": [...] } }
      final data = response['data'];
      final List<dynamic> postsJson;

      if (data is Map<String, dynamic>) {
        if (data.containsKey('data')) {
          postsJson = data['data'] as List<dynamic>;
        } else if (data.containsKey('items')) {
          postsJson = data['items'] as List<dynamic>;
        } else {
          // Try to find a list in the values
          final potentialList = data.values.firstWhere(
            (v) => v is List,
            orElse: () => null,
          );
          if (potentialList != null) {
            postsJson = potentialList as List<dynamic>;
          } else {
            postsJson = [];
          }
        }
      } else if (data is List<dynamic>) {
        postsJson = data;
      } else {
        postsJson = [];
      }

      return postsJson
          .map((json) => CommunityPost.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to load posts: $e');
    }
  }

  /// Get post by ID
  Future<CommunityPost> getPostById(int postId) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.communityPostById(postId),
        includeAuth: false,
      );

      // Handle ApiResponse structure
      final data =
          response is Map<String, dynamic> && response.containsKey('data')
          ? response['data']
          : response;

      return CommunityPost.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to load post: $e');
    }
  }

  /// Create new post
  Future<CommunityPost> createPost(String title, String content) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.communityPosts,
        body: {'title': title, 'content': content},
        includeAuth: true,
      );

      // Handle ApiResponse structure
      final data =
          response is Map<String, dynamic> && response.containsKey('data')
          ? response['data']
          : response;

      return CommunityPost.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to create post: $e');
    }
  }

  /// Delete post
  Future<void> deletePost(int postId) async {
    try {
      await _apiClient.delete(
        ApiEndpoints.communityPostById(postId),
        includeAuth: true,
      );
    } catch (e) {
      throw Exception('Failed to delete post: $e');
    }
  }

  /// Like/unlike post
  Future<void> toggleLikePost(int postId) async {
    try {
      await _apiClient.post(
        '${ApiEndpoints.communityPostById(postId)}/like',
        includeAuth: true,
      );
    } catch (e) {
      throw Exception('Failed to like post: $e');
    }
  }

  /// Bookmark/unbookmark post
  Future<void> toggleBookmarkPost(int postId) async {
    try {
      await _apiClient.post(
        '${ApiEndpoints.communityPostById(postId)}/bookmark',
        includeAuth: true,
      );
    } catch (e) {
      throw Exception('Failed to bookmark post: $e');
    }
  }

  /// Get comments for a post
  Future<List<Comment>> getCommentsByPostId(int postId) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.postComments(postId),
        includeAuth: false,
      );

      // Handle ApiResponse structure
      final data =
          response is Map<String, dynamic> && response.containsKey('data')
          ? response['data']
          : response;

      final List<dynamic> commentsJson = data as List<dynamic>;
      return commentsJson
          .map((json) => Comment.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to load comments: $e');
    }
  }

  /// Create comment
  Future<Comment> createComment(int postId, String content) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.comments,
        body: {'postId': postId, 'content': content},
        includeAuth: true,
      );

      // Handle ApiResponse structure
      final data =
          response is Map<String, dynamic> && response.containsKey('data')
          ? response['data']
          : response;

      return Comment.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to create comment: $e');
    }
  }

  /// Delete comment
  Future<void> deleteComment(int commentId) async {
    try {
      await _apiClient.delete(
        '${ApiEndpoints.comments}/$commentId',
        includeAuth: true,
      );
    } catch (e) {
      throw Exception('Failed to delete comment: $e');
    }
  }

  /// Get articles
  Future<List<Article>> getArticles({int page = 1, int pageSize = 20}) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.articles,
        queryParams: {'page': page.toString(), 'pageSize': pageSize.toString()},
        includeAuth: false,
      );

      // Handle ApiResponse structure
      final data = response['data'];
      final List<dynamic> articlesJson;

      if (data is Map<String, dynamic> && data.containsKey('items')) {
        articlesJson = data['items'] as List<dynamic>;
      } else if (data is List<dynamic>) {
        articlesJson = data;
      } else {
        articlesJson = [];
      }

      return articlesJson
          .map((json) => Article.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to load articles: $e');
    }
  }

  /// Get article by ID
  Future<Article> getArticleById(int articleId) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.articleById(articleId),
        includeAuth: false,
      );

      // Handle ApiResponse structure
      final data =
          response is Map<String, dynamic> && response.containsKey('data')
          ? response['data']
          : response;

      return Article.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to load article: $e');
    }
  }
}
