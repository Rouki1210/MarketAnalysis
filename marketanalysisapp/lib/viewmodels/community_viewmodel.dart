import 'package:flutter/foundation.dart';
import '../models/community_model.dart';
import '../models/topic_model.dart';
import '../repositories/community_repository.dart';

/// Community ViewModel for managing posts and interactions
class CommunityViewModel extends ChangeNotifier {
  final CommunityRepository _communityRepository;

  CommunityViewModel({CommunityRepository? communityRepository})
    : _communityRepository = communityRepository ?? CommunityRepository();

  // State
  List<CommunityPost> _posts = [];
  List<Topic> _topics = [];
  List<Article> _articles = [];
  List<CommunityPost> _trendingPosts = [];

  bool _isLoading = false;
  bool _isLoadingMore = false;
  String? _errorMessage;
  int _currentPage = 1;
  final int _pageSize = 20;
  bool _hasMorePosts = true;

  // Filter State
  String _currentSort = 'latest'; // 'latest', 'trending', 'top'
  String? _currentFilter; // 'week', 'month', 'all'

  // Getters
  List<CommunityPost> get posts => _posts;
  List<Topic> get topics => _topics;
  List<Article> get articles => _articles;
  List<CommunityPost> get trendingPosts => _trendingPosts;

  bool get isLoading => _isLoading;
  bool get isLoadingMore => _isLoadingMore;
  String? get errorMessage => _errorMessage;
  bool get hasMorePosts => _hasMorePosts;
  String get currentSort => _currentSort;

  /// Load initial posts with current sort
  Future<void> loadPosts({String? sortBy, String? filterBy}) async {
    if (_isLoading) return;

    _isLoading = true;
    _errorMessage = null;
    _currentPage = 1;

    if (sortBy != null) _currentSort = sortBy;
    if (filterBy != null) _currentFilter = filterBy;

    notifyListeners();

    try {
      final newPosts = await _communityRepository.getPosts(
        page: _currentPage,
        pageSize: _pageSize,
        sortBy: _currentSort,
        filterBy: _currentFilter,
      );

      _posts = newPosts;
      _hasMorePosts = newPosts.length >= _pageSize;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  /// Load more posts (pagination)
  Future<void> loadMorePosts() async {
    if (_isLoading || _isLoadingMore || !_hasMorePosts) return;

    _isLoadingMore = true;
    notifyListeners();

    try {
      final nextPage = _currentPage + 1;
      final newPosts = await _communityRepository.getPosts(
        page: nextPage,
        pageSize: _pageSize,
        sortBy: _currentSort,
        filterBy: _currentFilter,
      );

      if (newPosts.isEmpty) {
        _hasMorePosts = false;
      } else {
        _posts.addAll(newPosts);
        _currentPage = nextPage;
        _hasMorePosts = newPosts.length >= _pageSize;
      }

      _isLoadingMore = false;
      notifyListeners();
    } catch (e) {
      _isLoadingMore = false;
      // Don't show error for pagination, just stop loading
      notifyListeners();
    }
  }

  /// Load topics
  Future<void> loadTopics() async {
    try {
      _topics = await _communityRepository.getTopics();
      notifyListeners();
    } catch (e) {
      print('Error loading topics: $e');
    }
  }

  /// Load articles
  Future<void> loadArticles({String? category}) async {
    try {
      _articles = await _communityRepository.getArticles(category: category);
      notifyListeners();
    } catch (e) {
      print('Error loading articles: $e');
    }
  }

  /// Load trending posts specifically for Trending tab
  Future<void> loadTrendingPosts() async {
    try {
      // Re-use getPosts but force trending sort
      _trendingPosts = await _communityRepository.getPosts(
        page: 1,
        pageSize: 10,
        sortBy: 'trending',
      );
      notifyListeners();
    } catch (e) {
      print('Error loading trending posts: $e');
    }
  }

  /// Load posts by topic
  Future<void> loadPostsByTopic(int topicId) async {
    if (_isLoading) return;
    _isLoading = true;
    notifyListeners();

    try {
      _posts = await _communityRepository.getPostsByTopic(topicId);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  /// Load user posts
  Future<void> loadUserPosts(int userId) async {
    if (_isLoading) return;
    _isLoading = true;
    notifyListeners();

    try {
      _posts = await _communityRepository.getUserPosts(userId);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  /// Change sort order
  void setSortOrder(String sort) {
    if (_currentSort != sort) {
      loadPosts(sortBy: sort);
    }
  }

  /// Refresh posts
  Future<void> refresh() async {
    await loadPosts();
  }

  /// Create a new post
  Future<bool> createPost(
    String title,
    String content, {
    List<String>? tags,
  }) async {
    try {
      final newPost = await _communityRepository.createPost(
        title,
        content,
        tags: tags,
      );
      _posts.insert(0, newPost);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Toggle like on a post
  Future<void> toggleLike(int postId) async {
    final index = _posts.indexWhere((p) => p.id == postId);
    if (index == -1) return;

    // Optimistic update
    final post = _posts[index];
    final wasLiked = post.isLiked;
    final newLikeCount = wasLiked ? post.likesCount - 1 : post.likesCount + 1;

    _posts[index] = post.copyWith(isLiked: !wasLiked, likesCount: newLikeCount);
    notifyListeners();

    try {
      await _communityRepository.toggleLikePost(postId);
    } catch (e) {
      // Revert on failure
      _posts[index] = post;
      notifyListeners();
      // Optionally show error
    }
  }

  /// Toggle bookmark on a post
  Future<void> toggleBookmark(int postId) async {
    final index = _posts.indexWhere((p) => p.id == postId);
    if (index == -1) return;

    // Optimistic update
    final post = _posts[index];
    final wasBookmarked = post.isBookmarked;

    _posts[index] = post.copyWith(isBookmarked: !wasBookmarked);
    notifyListeners();

    try {
      await _communityRepository.toggleBookmarkPost(postId);
    } catch (e) {
      // Revert on failure
      _posts[index] = post;
      notifyListeners();
    }
  }

  // Notification State
  List<dynamic> _notifications = [];
  int _unreadNotificationsCount = 0;

  List<dynamic> get notifications => _notifications;
  int get unreadNotificationsCount => _unreadNotificationsCount;

  /// Load notifications
  Future<void> loadNotifications() async {
    if (_isLoading) return;
    _isLoading = true;
    notifyListeners();

    try {
      _notifications = await _communityRepository.getNotifications();
      // Calculate unread count (assuming 'isRead' field exists)
      _unreadNotificationsCount = _notifications
          .where((n) => n['isRead'] == false)
          .length;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      print('Error loading notifications: $e');
      notifyListeners();
    }
  }

  /// Mark notification as read
  Future<void> markNotificationAsRead(int id) async {
    try {
      await _communityRepository.markNotificationAsRead(id);
      final index = _notifications.indexWhere((n) => n['id'] == id);
      if (index != -1) {
        _notifications[index]['isRead'] = true;
        _unreadNotificationsCount = (_unreadNotificationsCount - 1).clamp(
          0,
          999,
        );
        notifyListeners();
      }
    } catch (e) {
      print('Error marking notification as read: $e');
    }
  }

  /// Mark all notifications as read
  Future<void> markAllNotificationsAsRead() async {
    try {
      await _communityRepository.markAllNotificationsAsRead();
      for (var n in _notifications) {
        n['isRead'] = true;
      }
      _unreadNotificationsCount = 0;
      notifyListeners();
    } catch (e) {
      print('Error marking all notifications as read: $e');
    }
  }

  /// Update a specific post in the list (e.g. after returning from detail view)
  void updatePost(CommunityPost updatedPost) {
    final index = _posts.indexWhere((p) => p.id == updatedPost.id);
    if (index != -1) {
      _posts[index] = updatedPost;
      notifyListeners();
    }
  }
}
