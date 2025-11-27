import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/community_model.dart';
import '../../viewmodels/post_detail_viewmodel.dart';

class PostDetailScreen extends StatelessWidget {
  final int postId;
  final CommunityPost? initialPost;

  const PostDetailScreen({super.key, required this.postId, this.initialPost});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => PostDetailViewModel(postId)..loadPostDetails(),
      child: Consumer<PostDetailViewModel>(
        builder: (context, viewModel, child) {
          return PopScope(
            canPop: true,
            onPopInvokedWithResult: (didPop, result) {
              if (didPop) return;
            },
            child: Scaffold(
              backgroundColor: AppColors.primaryBackground,
              appBar: AppBar(
                title: const Text('Post Details'),
                backgroundColor: AppColors.primaryBackground,
                elevation: 0,
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: () {
                    Navigator.pop(context, viewModel.post);
                  },
                ),
              ),
              body: Builder(
                builder: (context) {
                  if (viewModel.isLoading && viewModel.post == null) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  final post = viewModel.post ?? initialPost;

                  if (post == null) {
                    return const Center(
                      child: Text(
                        'Post not found',
                        style: TextStyle(color: Colors.white),
                      ),
                    );
                  }

                  return Column(
                    children: [
                      Expanded(
                        child: ListView(
                          padding: const EdgeInsets.all(16),
                          children: [
                            // Post Content
                            _PostContent(post: post, viewModel: viewModel),

                            const Divider(color: AppColors.border, height: 32),

                            // Comments Header
                            Text(
                              'Comments (${viewModel.comments.length})',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Comments List
                            if (viewModel.comments.isEmpty)
                              const Padding(
                                padding: EdgeInsets.symmetric(vertical: 32),
                                child: Center(
                                  child: Text(
                                    'No comments yet. Be the first!',
                                    style: TextStyle(
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ),
                              )
                            else
                              ...viewModel.comments.map(
                                (comment) => _CommentItem(comment: comment),
                              ),
                          ],
                        ),
                      ),

                      // Comment Input
                      _CommentInput(viewModel: viewModel),
                    ],
                  );
                },
              ),
            ),
          );
        },
      ),
    );
  }
}

class _PostContent extends StatelessWidget {
  final CommunityPost post;
  final PostDetailViewModel viewModel;

  const _PostContent({required this.post, required this.viewModel});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Author Info
        Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: AppColors.primaryAccent.withValues(alpha: 0.2),
              child: Text(
                (post.authorName ?? 'U')[0].toUpperCase(),
                style: const TextStyle(
                  color: AppColors.primaryAccent,
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  post.authorName ?? 'Unknown User',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    fontSize: 16,
                  ),
                ),
                Text(
                  Formatters.timeAgo(post.createdAt),
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textTertiary,
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 20),

        // Title
        Text(
          post.title,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 12),

        // Content
        Text(
          post.content,
          style: const TextStyle(
            fontSize: 16,
            color: AppColors.textSecondary,
            height: 1.6,
          ),
        ),
        const SizedBox(height: 24),

        // Interactions
        Row(
          children: [
            _InteractionButton(
              icon: post.isLiked ? Icons.favorite : Icons.favorite_border,
              label: '${post.likesCount}',
              color: post.isLiked ? AppColors.error : AppColors.textSecondary,
              onTap: () => viewModel.toggleLike(),
            ),
            const SizedBox(width: 24),
            _InteractionButton(
              icon: Icons.comment_outlined,
              label: '${post.commentsCount}',
              color: AppColors.textSecondary,
              onTap: () {}, // Already on detail screen
            ),
            const SizedBox(width: 24),
            _InteractionButton(
              icon: Icons.remove_red_eye_outlined,
              label: '${post.viewCount}',
              color: AppColors.textSecondary,
              onTap: () {}, // View only
            ),
          ],
        ),
      ],
    );
  }
}

class _CommentItem extends StatelessWidget {
  final Comment comment;

  const _CommentItem({required this.comment});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: AppColors.textSecondary.withValues(alpha: 0.2),
                child: Text(
                  (comment.authorName ?? 'U')[0].toUpperCase(),
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                comment.authorName ?? 'Unknown',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  fontSize: 14,
                ),
              ),
              const Spacer(),
              Text(
                Formatters.timeAgo(comment.createdAt),
                style: const TextStyle(
                  fontSize: 10,
                  color: AppColors.textTertiary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            comment.content,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

class _CommentInput extends StatefulWidget {
  final PostDetailViewModel viewModel;

  const _CommentInput({required this.viewModel});

  @override
  State<_CommentInput> createState() => _CommentInputState();
}

class _CommentInputState extends State<_CommentInput> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppColors.cardBackground,
        border: Border(top: BorderSide(color: AppColors.border, width: 0.5)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _controller,
              decoration: InputDecoration(
                hintText: 'Write a comment...',
                hintStyle: const TextStyle(color: AppColors.textTertiary),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: AppColors.primaryBackground,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
              ),
              style: const TextStyle(color: Colors.white),
              maxLines: null,
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            onPressed: widget.viewModel.isSendingComment
                ? null
                : () {
                    if (_controller.text.trim().isNotEmpty) {
                      widget.viewModel.addComment(_controller.text);
                      _controller.clear();
                      FocusScope.of(context).unfocus();
                    }
                  },
            icon: widget.viewModel.isSendingComment
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.send, color: AppColors.primaryAccent),
          ),
        ],
      ),
    );
  }
}

class _InteractionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _InteractionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 20, color: color),
            if (label.isNotEmpty) ...[
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  color: color,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
