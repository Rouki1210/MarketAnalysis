import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  CommunityUserService,
  CommunityUser,
} from '../../services/user.service';

/**
 * CommunityProfileComponent
 *
 * User profile page displaying stats and activity
 *
 * Features:
 * - User profile header with avatar and bio
 * - Stats display (posts, followers, following, points)
 * - Location and website information
 * - Join date formatting
 * - Recent activity section
 * - Support for viewing other users via route param
 */
@Component({
  selector: 'app-community-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="user()" class="space-y-6">
      <!-- Profile Header -->
      <div
        class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8"
      >
        <div class="flex items-start gap-6">
          <div
            class="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl flex-shrink-0"
          >
            {{ user()?.avatar || '👤' }}
          </div>

          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-3xl font-bold text-white">
                {{ user()?.username }}
              </h1>
              <span *ngIf="user()?.verified" class="text-blue-400 text-xl"
                >✓</span
              >
            </div>

            <p class="text-gray-400 mb-4">{{ user()?.email }}</p>

            <p *ngIf="user()?.bio" class="text-gray-300 mb-4">
              {{ user()?.bio }}
            </p>

            <div class="flex items-center gap-6 text-sm">
              <div
                *ngIf="user()?.location"
                class="flex items-center gap-2 text-gray-400"
              >
                <span>📍</span>
                {{ user()?.location }}
              </div>
              <div
                *ngIf="user()?.website"
                class="flex items-center gap-2 text-gray-400"
              >
                <span>🔗</span>
                <a
                  [href]="user()?.website"
                  target="_blank"
                  class="hover:text-purple-400 transition-colors"
                >
                  {{ user()?.website }}
                </a>
              </div>
              <div class="flex items-center gap-2 text-gray-400">
                <span>📅</span>
                Joined {{ formatDate(user()?.joinedAt || '') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 text-center"
        >
          <div class="text-3xl font-bold text-white mb-1">
            {{ user()?.posts }}
          </div>
          <div class="text-gray-400 text-sm">Posts</div>
        </div>

        <div
          class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 text-center"
        >
          <div class="text-3xl font-bold text-white mb-1">
            {{ (user()?.followers || 0).toLocaleString() }}
          </div>
          <div class="text-gray-400 text-sm">Followers</div>
        </div>

        <div
          class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 text-center"
        >
          <div class="text-3xl font-bold text-white mb-1">
            {{ user()?.following || 0 }}
          </div>
          <div class="text-gray-400 text-sm">Following</div>
        </div>

        <div
          class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 text-center"
        >
          <div class="text-3xl font-bold text-white mb-1">
            {{ (user()?.points || 0).toLocaleString() }}
          </div>
          <div class="text-gray-400 text-sm">Points</div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div
        class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
      >
        <h2 class="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <p class="text-gray-400 text-center py-8">No recent activity</p>
      </div>
    </div>

    <div *ngIf="!user()" class="text-center py-12">
      <div class="text-6xl mb-4">👤</div>
      <h3 class="text-xl font-semibold text-white mb-2">User not found</h3>
      <p class="text-gray-400">The user you're looking for doesn't exist</p>
    </div>
  `,
  styles: [],
})
export class CommunityProfileComponent implements OnInit {
  user = signal<CommunityUser | null>(null);
  userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private userService: CommunityUserService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId = params['userId'] || null;
      this.loadUser();
    });
  }

  loadUser(): void {
    if (this.userId) {
      this.userService.getUserById(this.userId).subscribe(
        (user) => this.user.set(user),
        (error) => this.user.set(null)
      );
    } else {
      // Load current user
      this.userService.getCurrentUser().subscribe(
        (user) => this.user.set(user),
        (error) => this.user.set(null)
      );
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  }
}
