import '../core/api/api_client.dart';
import '../core/api/api_endpoints.dart';
import '../models/community_model.dart';
import '../models/topic_model.dart';

/// Repository for community features
class CommunityRepository {
  final ApiClient _apiClient;

  CommunityRepository({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient();

  /// Get community posts (with pagination and sorting)
  Future<List<CommunityPost>> getPosts({
    int page = 1,
    int pageSize = 20,
    String sortBy = 'latest', // 'latest', 'trending', 'top'
    String? filterBy, // 'week', 'month', 'all' for top/trending
  }) async {
    try {
      // Use dedicated endpoint for trending
      if (sortBy == 'trending') {
        final response = await _apiClient.get(
          '${ApiEndpoints.communityPosts}/trending',
          queryParams: {'hours': '24', 'limit': pageSize.toString()},
          includeAuth: false,
        );
        return _parsePostsResponse(response);
      }

      final queryParams = {
        'page': page.toString(),
        'pageSize': pageSize.toString(),
        'sortBy': sortBy,
      };

      if (filterBy != null) {
        queryParams['filterBy'] = filterBy;
      }

      final response = await _apiClient.get(
        ApiEndpoints.communityPosts,
        queryParams: queryParams,
        includeAuth: false,
      );

      return _parsePostsResponse(response);
    } catch (e) {
      throw Exception('Failed to load posts: $e');
    }
  }

  /// Get posts by topic
  Future<List<CommunityPost>> getPostsByTopic(
    int topicId, {
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      final response = await _apiClient.get(
        '${ApiEndpoints.communityPosts}/topic/$topicId',
        queryParams: {'page': page.toString(), 'pageSize': pageSize.toString()},
        includeAuth: false,
      );
      return _parsePostsResponse(response);
    } catch (e) {
      throw Exception('Failed to load posts by topic: $e');
    }
  }

  /// Get user posts
  Future<List<CommunityPost>> getUserPosts(
    int userId, {
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      final response = await _apiClient.get(
        '${ApiEndpoints.communityPosts}/user/$userId',
        queryParams: {'page': page.toString(), 'pageSize': pageSize.toString()},
        includeAuth: false,
      );
      return _parsePostsResponse(response);
    } catch (e) {
      throw Exception('Failed to load user posts: $e');
    }
  }

  List<CommunityPost> _parsePostsResponse(dynamic response) {
    // Handle ApiResponse structure
    // Expected: { "success": true, "data": { "data": [...] } } or { "success": true, "data": [...] }
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
  }

  /// Get topics
  Future<List<Topic>> getTopics() async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.topics,
        includeAuth: false,
      );

      // Handle ApiResponse structure
      final data = response['data'];
      final List<dynamic> topicsJson;

      if (data is List<dynamic>) {
        topicsJson = data;
      } else if (data is Map<String, dynamic> && data.containsKey('items')) {
        topicsJson = data['items'] as List<dynamic>;
      } else {
        topicsJson = [];
      }

      return topicsJson
          .map((json) => Topic.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      // Fallback to mock data if endpoint fails or doesn't exist yet
      print('Error loading topics: $e. Using mock data.');
      return [
        Topic(id: 1, name: 'Bitcoin', postCount: 1250, iconUrl: 'BTC'),
        Topic(id: 2, name: 'Altcoins', postCount: 850, iconUrl: 'ETH'),
        Topic(id: 3, name: 'DeFi', postCount: 420, iconUrl: 'DEFI'),
        Topic(id: 4, name: 'NFTs', postCount: 310, iconUrl: 'NFT'),
        Topic(id: 5, name: 'Trading', postCount: 950, iconUrl: 'CHART'),
        Topic(id: 6, name: 'Education', postCount: 150, iconUrl: 'BOOK'),
        Topic(id: 7, name: 'News', postCount: 600, iconUrl: 'NEWS'),
        Topic(id: 8, name: 'Ethereum', postCount: 780, iconUrl: 'ETH'),
      ];
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
  Future<CommunityPost> createPost(
    String title,
    String content, {
    List<String>? tags,
  }) async {
    try {
      final Map<String, dynamic> body = {'title': title, 'content': content};
      if (tags != null && tags.isNotEmpty) {
        body['tags'] = tags;
      }

      final response = await _apiClient.post(
        ApiEndpoints.communityPosts,
        body: body,
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

  /// Get notifications
  Future<List<dynamic>> getNotifications({
    int page = 1,
    int pageSize = 20,
  }) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.notifications,
        queryParams: {'page': page.toString(), 'pageSize': pageSize.toString()},
        includeAuth: true,
      );

      // Handle ApiResponse structure
      final data = response['data'];
      if (data is Map<String, dynamic> && data.containsKey('items')) {
        return data['items'] as List<dynamic>;
      } else if (data is List<dynamic>) {
        return data;
      } else {
        return [];
      }
    } catch (e) {
      throw Exception('Failed to load notifications: $e');
    }
  }

  /// Mark notification as read
  Future<void> markNotificationAsRead(int id) async {
    try {
      await _apiClient.put(
        '${ApiEndpoints.notifications}/$id/mark-read',
        includeAuth: true,
      );
    } catch (e) {
      throw Exception('Failed to mark notification as read: $e');
    }
  }

  /// Mark all notifications as read
  Future<void> markAllNotificationsAsRead() async {
    try {
      await _apiClient.put(
        '${ApiEndpoints.notifications}/mark-all-read',
        includeAuth: true,
      );
    } catch (e) {
      throw Exception('Failed to mark all notifications as read: $e');
    }
  }

  /// Get articles
  Future<List<Article>> getArticles({
    int page = 1,
    int pageSize = 20,
    String? category,
  }) async {
    try {
      final String endpoint = category != null
          ? '${ApiEndpoints.articles}/category/$category'
          : ApiEndpoints.articles;

      final response = await _apiClient.get(
        endpoint,
        queryParams: {'page': page.toString(), 'pageSize': pageSize.toString()},
        includeAuth: false,
      );

      // Handle ApiResponse structure
      final data = response['data'];
      final List<dynamic> articlesJson;

      if (data is Map<String, dynamic> && data.containsKey('items')) {
        articlesJson = data['items'] as List<dynamic>;
      } else if (data is Map<String, dynamic> && data.containsKey('data')) {
        articlesJson = data['data'] as List<dynamic>;
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
