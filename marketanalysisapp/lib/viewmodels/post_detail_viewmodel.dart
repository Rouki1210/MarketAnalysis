import 'package:flutter/foundation.dart';
import '../models/community_model.dart';
import '../repositories/community_repository.dart';

class PostDetailViewModel extends ChangeNotifier {
  final CommunityRepository _communityRepository;
  final int postId;

  PostDetailViewModel(this.postId, {CommunityRepository? communityRepository})
    : _communityRepository = communityRepository ?? CommunityRepository();

  CommunityPost? _post;
  List<Comment> _comments = [];
  bool _isLoading = false;
  bool _isSendingComment = false;
  String? _errorMessage;

  CommunityPost? get post => _post;
  List<Comment> get comments => _comments;
  bool get isLoading => _isLoading;
  bool get isSendingComment => _isSendingComment;
  String? get errorMessage => _errorMessage;

  Future<void> loadPostDetails() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Load post info (refresh it) and comments in parallel
      final results = await Future.wait([
        _communityRepository.getPostById(postId),
        _communityRepository.getCommentsByPostId(postId),
      ]);

      _post = results[0] as CommunityPost;
      _comments = results[1] as List<Comment>;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  Future<void> addComment(String content) async {
    if (content.trim().isEmpty) return;

    _isSendingComment = true;
    notifyListeners();

    try {
      final newComment = await _communityRepository.createComment(
        postId,
        content,
      );
      _comments.add(newComment);

      // Update post comment count locally if possible
      if (_post != null) {
        _post = _post!.copyWith(commentsCount: _post!.commentsCount + 1);
      }

      _isSendingComment = false;
      notifyListeners();
    } catch (e) {
      _isSendingComment = false;
      _errorMessage = "Failed to post comment: $e";
      notifyListeners();
    }
  }

  Future<void> toggleLike() async {
    if (_post == null) return;

    final wasLiked = _post!.isLiked;
    final newLikeCount = wasLiked
        ? _post!.likesCount - 1
        : _post!.likesCount + 1;

    // Optimistic update
    _post = _post!.copyWith(isLiked: !wasLiked, likesCount: newLikeCount);
    notifyListeners();

    try {
      await _communityRepository.toggleLikePost(postId);
    } catch (e) {
      // Revert
      _post = _post!.copyWith(
        isLiked: wasLiked,
        likesCount: wasLiked ? newLikeCount + 1 : newLikeCount - 1,
      );
      notifyListeners();
    }
  }
}
