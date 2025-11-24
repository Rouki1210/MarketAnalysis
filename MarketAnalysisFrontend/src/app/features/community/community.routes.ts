import { Routes } from '@angular/router';

export const communityRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/layout/community-layout.component').then(m => m.CommunityLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(m => m.CommunityHomeComponent)
      },
      {
        path: 'feed',
        loadComponent: () => import('./pages/feed/feed.component').then(m => m.FeedComponent)
      },
      {
        path: 'topics',
        loadComponent: () => import('./pages/topics/topics.component').then(m => m.TopicsComponent)
      },
      {
        path: 'topic/:id',
        loadComponent: () => import('./pages/post-detail/post-detail.component').then(m => m.TopicDetailComponent)
      },
      {
        path: 'articles',
        loadComponent: () => import('./pages/articles/articles.component').then(m => m.ArticlesComponent)
      },
      {
        path: 'articles/:id',
        loadComponent: () => import('./pages/articles/article-detail.component').then(m => m.ArticleDetailComponent)
      },
      {
        path: 'trending',
        loadComponent: () => import('./pages/trending/trending.component').then(m => m.TrendingComponent)
      },
      {
        path: 'leaderboard',
        loadComponent: () => import('./pages/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.CommunityProfileComponent)
      },
      {
        path: 'profile/:userId',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.CommunityProfileComponent)
      },
      {
        path: 'post/:id',
        loadComponent: () => import('./pages/post-detail/post-detail.component').then(m => m.TopicDetailComponent)
      }
    ]
  }
];

