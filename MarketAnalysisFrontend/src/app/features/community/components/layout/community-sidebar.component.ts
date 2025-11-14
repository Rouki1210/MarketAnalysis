import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LeaderboardEntry } from '../../services/leaderboard.service';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-community-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="space-y-4">
      <!-- Logo & Title -->
      <a routerLink="/community" class="flex items-center gap-3 px-4 py-3 bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl hover:bg-white/10 transition-all">
        <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <span class="text-white text-xl">📈</span>
        </div>
        <h1 class="text-xl font-bold text-white">CMC Community</h1>
      </a>

      <!-- Navigation -->
      <div class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
        <h3 class="text-white font-semibold mb-3 flex items-center gap-2">
          <span class="text-orange-500">🔥</span>
          Navigation
        </h3>
        <nav class="space-y-2">
          <a
            *ngFor="let item of navItems"
            [routerLink]="item.path"
            routerLinkActive="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
            [routerLinkActiveOptions]="{ exact: false }"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-300 hover:bg-white/10">
            <span>{{ item.icon }}</span>
            {{ item.label }}
          </a>
        </nav>
      </div>
    </aside>
  `,
  styles: []
})
export class CommunitySidebarComponent {
  @Input() leaderboard: LeaderboardEntry[] = [];

  navItems: NavItem[] = [
    { id: 'feed', label: 'Feed', icon: '💬', path: '/community/feed' },
    { id: 'topics', label: 'Topics', icon: '🏷️', path: '/community/topics' },
    { id: 'articles', label: 'Articles', icon: '📰', path: '/community/articles' },
    { id: 'trending', label: 'Trending', icon: '🔥', path: '/community/trending' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', path: '/community/notifications' }
  ];

  constructor(private router: Router) {}
}

