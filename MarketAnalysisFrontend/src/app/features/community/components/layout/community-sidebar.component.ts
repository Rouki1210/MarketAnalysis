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

      <!-- Top Contributors -->
      <div class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
        <h3 class="text-white font-semibold mb-3 flex items-center gap-2">
          <span class="text-yellow-500">⭐</span>
          Top Contributors
        </h3>
        <div class="space-y-3">
          <div *ngFor="let user of leaderboard.slice(0, 3)" class="flex items-center gap-3">
            <span class="text-2xl">{{ user.badge }}</span>
            <div class="flex-1">
              <p class="text-white font-medium text-sm">{{ user.user.username }}</p>
              <p class="text-gray-400 text-xs">{{ user.points.toLocaleString() }} points</p>
            </div>
          </div>
        </div>
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

