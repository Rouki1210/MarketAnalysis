import { Routes } from '@angular/router';

/**
 * Community Feature Routes
 *
 * Lazy-loaded routes for social/community features including:
 * - Home: Community dashboard
 * - Feed: User-generated posts and discussions
 * - Topics: Browse topics by category
 * - Articles: Read and publish articles
 * - Trending: Popular posts and topics
 * - Leaderboard: Top contributors
 * - Notifications: User activity notifications
 * - Profile: User profiles (own and others)
 * - Post Detail: Individual post/topic views
 *
 * All routes use lazy loading for optimal performance
 * and are wrapped in CommunityLayoutComponent providing
 * consistent header/sidebar navigation
 */
export const communityRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/layout/community-layout.component').then(
        (m) => m.CommunityLayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        // Community dashboard
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then(
            (m) => m.CommunityHomeComponent
          ),
      },
      {
        // User posts feed
        path: 'feed',
        loadComponent: () =>
          import('./pages/feed/feed.component').then((m) => m.FeedComponent),
      },
      {
        // Browse topics
        path: 'topics',
        loadComponent: () =>
          import('./pages/topics/topics.component').then(
            (m) => m.TopicsComponent
          ),
      },
      {
        // Individual topic detail
        path: 'topic/:id',
        loadComponent: () =>
          import('./pages/post-detail/post-detail.component').then(
            (m) => m.TopicDetailComponent
          ),
      },
      {
        // Articles list
        path: 'articles',
        loadComponent: () =>
          import('./pages/articles/articles.component').then(
            (m) => m.ArticlesComponent
          ),
      },
      {
        // Individual article view
        path: 'articles/:id',
        loadComponent: () =>
          import('./pages/articles/article-detail.component').then(
            (m) => m.ArticleDetailComponent
          ),
      },
      {
        // Trending content
        path: 'trending',
        loadComponent: () =>
          import('./pages/trending/trending.component').then(
            (m) => m.TrendingComponent
          ),
      },
      {
        // User leaderboard
        path: 'leaderboard',
        loadComponent: () =>
          import('./pages/leaderboard/leaderboard.component').then(
            (m) => m.LeaderboardComponent
          ),
      },
      {
        // User notifications
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications.component').then(
            (m) => m.NotificationsComponent
          ),
      },
      {
        // Own profile
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then(
            (m) => m.CommunityProfileComponent
          ),
      },
      {
        // Other user's profile
        path: 'profile/:userId',
        loadComponent: () =>
          import('./pages/profile/profile.component').then(
            (m) => m.CommunityProfileComponent
          ),
      },
      {
        // Individual post detail
        path: 'post/:id',
        loadComponent: () =>
          import('./pages/post-detail/post-detail.component').then(
            (m) => m.TopicDetailComponent
          ),
      },
    ],
  },
];
