import 'package:flutter/foundation.dart';
import '../models/community_model.dart';
import '../repositories/community_repository.dart';

/// Community ViewModel for managing posts and interactions
class CommunityViewModel extends ChangeNotifier {
  final CommunityRepository _communityRepository;

  CommunityViewModel({CommunityRepository? communityRepository})
    : _communityRepository = communityRepository ?? CommunityRepository();

  // State
  List<CommunityPost> _posts = [];
  bool _isLoading = false;
  bool _isLoadingMore = false;
  String? _errorMessage;
  int _currentPage = 1;
  final int _pageSize = 20;
  bool _hasMorePosts = true;

  // Getters
  List<CommunityPost> get posts => _posts;
  bool get isLoading => _isLoading;
  bool get isLoadingMore => _isLoadingMore;
  String? get errorMessage => _errorMessage;
  bool get hasMorePosts => _hasMorePosts;

  /// Load initial posts
  Future<void> loadPosts() async {
    if (_isLoading) return;

    _isLoading = true;
    _errorMessage = null;
    _currentPage = 1;
    notifyListeners();

    try {
      final newPosts = await _communityRepository.getPosts(
        page: _currentPage,
        pageSize: _pageSize,
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

  /// Refresh posts
  Future<void> refresh() async {
    await loadPosts();
  }

  /// Create a new post
  Future<bool> createPost(String title, String content) async {
    try {
      final newPost = await _communityRepository.createPost(title, content);
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

  /// Update a specific post in the list (e.g. after returning from detail view)
  void updatePost(CommunityPost updatedPost) {
    final index = _posts.indexWhere((p) => p.id == updatedPost.id);
    if (index != -1) {
      _posts[index] = updatedPost;
      notifyListeners();
    }
  }
}
