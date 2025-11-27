import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../models/community_model.dart';
import '../../../viewmodels/community_viewmodel.dart';
import '../post_detail_screen.dart';

class FeedView extends StatefulWidget {
  const FeedView({super.key});

  @override
  State<FeedView> createState() => _FeedViewState();
}

class _FeedViewState extends State<FeedView> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CommunityViewModel>().loadPosts();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CommunityViewModel>(
      builder: (context, viewModel, child) {
        return Column(
          children: [
            // Search Bar
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                controller: _searchController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Search discussions...',
                  hintStyle: TextStyle(color: AppColors.textTertiary),
                  prefixIcon: Icon(Icons.search, color: AppColors.textTertiary),
                  filled: true,
                  fillColor: AppColors.cardBackground,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),

            // Filter Tabs (Trending, Latest, Top)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _FilterButton(
                      label: 'Trending',
                      isSelected: viewModel.currentSort == 'trending',
                      onTap: () => viewModel.setSortOrder('trending'),
                    ),
                    const SizedBox(width: 12),
                    _FilterButton(
                      label: 'Latest',
                      isSelected: viewModel.currentSort == 'latest',
                      onTap: () => viewModel.setSortOrder('latest'),
                    ),
                    const SizedBox(width: 12),
                    _FilterButton(
                      label: 'Top',
                      isSelected: viewModel.currentSort == 'top',
                      onTap: () => viewModel.setSortOrder('top'),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Post List
            Expanded(
              child: viewModel.isLoading && viewModel.posts.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : RefreshIndicator(
                      onRefresh: () => viewModel.refresh(),
                      child: ListView.builder(
                        itemCount:
                            viewModel.posts.length +
                            (viewModel.isLoadingMore ? 1 : 0),
                        itemBuilder: (context, index) {
                          if (index == viewModel.posts.length) {
                            return const Padding(
                              padding: EdgeInsets.all(16.0),
                              child: Center(child: CircularProgressIndicator()),
                            );
                          }

                          final post = viewModel.posts[index];
                          return _PostCard(
                            post: post,
                            onLike: () => viewModel.toggleLike(post.id),
                            onComment: () => _navigateToPostDetail(post.id),
                            onBookmark: () => viewModel.toggleBookmark(post.id),
                          );
                        },
                      ),
                    ),
            ),
          ],
        );
      },
    );
  }

  void _navigateToPostDetail(int postId) async {
    final updatedPost = await Navigator.push<CommunityPost>(
      context,
      MaterialPageRoute(builder: (context) => PostDetailScreen(postId: postId)),
    );

    if (updatedPost != null && mounted) {
      context.read<CommunityViewModel>().updatePost(updatedPost);
    }
  }
}

class _FilterButton extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterButton({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primaryAccent
              : AppColors.cardBackground,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textSecondary,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}

class _PostCard extends StatelessWidget {
  final CommunityPost post;
  final VoidCallback onLike;
  final VoidCallback onComment;
  final VoidCallback onBookmark;

  const _PostCard({
    required this.post,
    required this.onLike,
    required this.onComment,
    required this.onBookmark,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: AppColors.cardBackground,
      child: InkWell(
        onTap: onComment,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User info
              Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: AppColors.primaryAccent.withValues(
                      alpha: 0.2,
                    ),
                    child: Text(
                      (post.authorName ?? 'U')[0].toUpperCase(),
                      style: TextStyle(
                        color: AppColors.primaryAccent,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          post.authorName ?? 'Unknown User',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          Formatters.timeAgo(post.createdAt),
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Post title
              Text(
                post.title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),

              const SizedBox(height: 8),

              // Post content
              Text(
                post.content,
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
                maxLines: 4,
                overflow: TextOverflow.ellipsis,
              ),

              const SizedBox(height: 16),

              // Interaction buttons
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _InteractionButton(
                      icon: post.isLiked
                          ? Icons.favorite
                          : Icons.favorite_border,
                      label: '${post.likesCount}',
                      color: post.isLiked
                          ? AppColors.error
                          : AppColors.textSecondary,
                      onTap: onLike,
                    ),
                    const SizedBox(width: 24),
                    _InteractionButton(
                      icon: Icons.comment_outlined,
                      label: '${post.commentsCount}',
                      color: AppColors.textSecondary,
                      onTap: onComment,
                    ),
                    const SizedBox(width: 24),
                    _InteractionButton(
                      icon: post.isBookmarked
                          ? Icons.bookmark
                          : Icons.bookmark_border,
                      label: '',
                      color: post.isBookmarked
                          ? AppColors.primaryAccent
                          : AppColors.textSecondary,
                      onTap: onBookmark,
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
              ),
            ],
          ),
        ),
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
