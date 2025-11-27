import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../models/topic_model.dart';
import '../../../viewmodels/community_viewmodel.dart';

class TopicsView extends StatefulWidget {
  const TopicsView({super.key});

  @override
  State<TopicsView> createState() => _TopicsViewState();
}

class _TopicsViewState extends State<TopicsView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final viewModel = context.read<CommunityViewModel>();
      viewModel.loadTopics();
      // Load recent discussions if not already loaded
      if (viewModel.posts.isEmpty) {
        viewModel.loadPosts();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<CommunityViewModel>(
      builder: (context, viewModel, child) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Topics',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const Text(
                'Explore trending discussions',
                style: TextStyle(fontSize: 14, color: AppColors.textTertiary),
              ),
              const SizedBox(height: 24),
              const Text(
                'Popular Topics',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),

              // Topics Grid
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.3,
                ),
                itemCount: viewModel.topics.length,
                itemBuilder: (context, index) {
                  return _TopicCard(topic: viewModel.topics[index]);
                },
              ),

              const SizedBox(height: 32),

              const Text(
                'Recent Discussions',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),

              // Recent Discussions List (reusing logic from Feed but simplified)
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: viewModel.posts.take(5).length,
                itemBuilder: (context, index) {
                  final post = viewModel.posts[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    color: AppColors.cardBackground,
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(16),
                      leading: CircleAvatar(
                        backgroundColor: AppColors.primaryAccent.withValues(
                          alpha: 0.2,
                        ),
                        child: Text(
                          (post.authorName ?? 'U')[0].toUpperCase(),
                          style: TextStyle(color: AppColors.primaryAccent),
                        ),
                      ),
                      title: Text(
                        post.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 4),
                          Text(
                            post.content,
                            style: TextStyle(color: AppColors.textSecondary),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(
                                Icons.favorite,
                                size: 14,
                                color: AppColors.textTertiary,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${post.likesCount}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textTertiary,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Icon(
                                Icons.comment,
                                size: 14,
                                color: AppColors.textTertiary,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${post.commentsCount}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textTertiary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

class _TopicCard extends StatelessWidget {
  final Topic topic;

  const _TopicCard({required this.topic});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border, width: 0.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Icon/Emoji placeholder
          Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Colors.transparent, // Or some background
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              _getEmojiForTopic(topic.name),
              style: const TextStyle(fontSize: 24),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            topic.name,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            '${topic.postCount} posts',
            style: TextStyle(color: AppColors.textTertiary, fontSize: 12),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  String _getEmojiForTopic(String name) {
    switch (name.toLowerCase()) {
      case 'bitcoin':
        return '₿';
      case 'altcoins':
        return '🪙';
      case 'defi':
        return '🏦';
      case 'nfts':
        return '🎨';
      case 'trading':
        return '📈';
      case 'education':
        return '📚';
      case 'news':
        return '📰';
      case 'ethereum':
        return 'Ξ';
      default:
        return '💬';
    }
  }
}
