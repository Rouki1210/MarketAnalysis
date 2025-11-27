import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../viewmodels/community_viewmodel.dart';
import '../../widgets/profile_button.dart';
import '../../widgets/user_menu_drawer.dart';
import 'tabs/articles_view.dart';
import 'tabs/feed_view.dart';

import 'tabs/topics_view.dart';
import 'tabs/trending_view.dart';
import 'community_notifications_screen.dart';

class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<String> _tabs = ['Feed', 'Topics', 'Articles', 'Trending'];

  final List<IconData> _tabIcons = [
    Icons.chat_bubble_outline,
    Icons.label_outline,
    Icons.article_outlined,
    Icons.local_fire_department_outlined,
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryBackground,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Colors.purpleAccent, Colors.pinkAccent],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.show_chart,
                color: Colors.white,
                size: 20,
              ),
            ),
            const SizedBox(width: 8),
            const Flexible(
              child: Text(
                'CMC Community',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: () => _showCreatePostDialog(),
          ),
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const CommunityNotificationsScreen(),
                ),
              );
            },
          ),
          const ProfileButton(),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(50),
          child: Container(
            alignment: Alignment.centerLeft,
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              tabAlignment: TabAlignment.start,
              indicatorColor: Colors.pinkAccent,
              indicatorWeight: 3,
              labelColor: Colors.white,
              unselectedLabelColor: AppColors.textSecondary,
              labelStyle: const TextStyle(fontWeight: FontWeight.bold),
              tabs: List.generate(_tabs.length, (index) {
                return Tab(
                  child: Row(
                    children: [
                      Icon(_tabIcons[index], size: 18),
                      const SizedBox(width: 8),
                      Text(_tabs[index]),
                    ],
                  ),
                );
              }),
            ),
          ),
        ),
      ),
      endDrawer: const UserMenuDrawer(),
      body: TabBarView(
        controller: _tabController,
        children: const [
          FeedView(),
          TopicsView(),
          ArticlesView(),
          TrendingView(),
        ],
      ),
    );
  }

  void _showCreatePostDialog() {
    final titleController = TextEditingController();
    final contentController = TextEditingController();
    final tagsController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: const Color(0xFF1E2235), // Dark blue/gray background
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Container(
          padding: const EdgeInsets.all(24),
          constraints: const BoxConstraints(maxWidth: 400),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Create New Post',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 24),

                // Title Input
                const Text(
                  'Title',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: titleController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'Post title',
                    hintStyle: TextStyle(color: AppColors.textTertiary),
                    filled: true,
                    fillColor: const Color(0xFF2A2E4A),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Content Input
                const Text(
                  'Content',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: contentController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: "What's on your mind?",
                    hintStyle: TextStyle(color: AppColors.textTertiary),
                    filled: true,
                    fillColor: const Color(0xFF2A2E4A),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.all(16),
                  ),
                  maxLines: 5,
                ),
                const SizedBox(height: 16),

                // Tags Input
                const Text(
                  'Tags (comma separated)',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: tagsController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'BTC, ETH, Analysis',
                    hintStyle: TextStyle(color: AppColors.textTertiary),
                    filled: true,
                    fillColor: const Color(0xFF2A2E4A),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Buttons
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          if (titleController.text.isNotEmpty &&
                              contentController.text.isNotEmpty) {
                            final tags = tagsController.text
                                .split(',')
                                .map((e) => e.trim())
                                .where((e) => e.isNotEmpty)
                                .toList();

                            context.read<CommunityViewModel>().createPost(
                              titleController.text,
                              contentController.text,
                              tags: tags,
                            );
                            Navigator.pop(context);
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF8B5CF6), // Purple
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          elevation: 0,
                        ),
                        child: const Text(
                          'Create Post',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text(
                        'Cancel',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
