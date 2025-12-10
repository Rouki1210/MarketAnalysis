import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { Post } from '../../models/post.model';
import { AvatarComponent } from '../common/avatar.component';

/**
 * PostListComponent
 *
 * Displays list of community posts with interactions
 *
 * Features:
 * - Post cards with author info and timestamps
 * - Like/comment/bookmark/share buttons
 * - Click to view post details
 * - Loading and empty states
 * - Relative time formatting (e.g., "2h ago")
 * - Event emission for all interactions
 */
@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [NgIf, NgFor, AvatarComponent],
  template: `
    <div class="space-y-4">
      <div
        *ngFor="let post of posts"
        class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 cursor-pointer"
        (click)="onSelect(post.id)"
      >
        <div class="flex items-start gap-4">
          <app-avatar
            [emoji]="post.author.avatarEmoji"
            size="md"
            [verified]="post.author.verified || false"
          >
          </app-avatar>

          <div class="flex-1" (click)="onSelect($event, post.id)">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <h3 class="text-white font-semibold whitespace-nowrap">
                {{ post.author.username }}
              </h3>
              <span *ngIf="post.author.verified" class="text-blue-400 text-sm"
                >✓</span
              >
              <span class="text-gray-400 text-sm whitespace-nowrap">{{
                formatDate(post.createdAt)
              }}</span>
            </div>

            <h4 class="text-white font-medium mb-2">{{ post.title }}</h4>
            <p class="text-gray-300 mb-4">{{ post.content }}</p>

            <div class="flex items-center gap-4">
              <button
                [class]="getLikeClasses(post.isLiked || false)"
                (click)="onLike($event, post.id)"
              >
                <span class="mr-1">{{ post.isLiked ? '❤️' : '🤍' }}</span>
                {{ post.likes }}
              </button>

              <button
                class="text-gray-400 hover:text-white transition-colors"
                (click)="onSelect($event, post.id)"
              >
                <span class="mr-1">💬</span>
                {{ post.comments }}
              </button>

              <button
                [class]="getBookmarkClasses(post.isBookmarked || false)"
                (click)="onBookmark($event, post.id)"
              >
                <span class="mr-1">{{ post.isBookmarked ? '🔖' : '📖' }}</span>
                {{ post.bookmarks }}
              </button>

              <button class="text-gray-400 hover:text-white transition-colors">
                <span class="mr-1">📤</span>
                {{ post.shares }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="posts.length === 0 && !loading" class="text-center py-8">
        <p class="text-gray-400">No posts found.</p>
      </div>

      <div *ngIf="loading" class="text-center py-8">
        <p class="text-gray-400">Loading posts...</p>
      </div>
    </div>
  `,
  styles: [],
})
export class PostListComponent {
  @Input() posts: Post[] = [];
  @Input() loading = false;
  @Output() like = new EventEmitter<string>();
  @Output() bookmark = new EventEmitter<string>();
  @Output() select = new EventEmitter<string>();

  getLikeClasses(isLiked: boolean): string {
    return `flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
      isLiked
        ? 'text-red-400 bg-red-400/10'
        : 'text-gray-400 hover:text-white hover:bg-white/10'
    }`;
  }

  getBookmarkClasses(isBookmarked: boolean): string {
    return `flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
      isBookmarked
        ? 'text-yellow-400 bg-yellow-400/10'
        : 'text-gray-400 hover:text-white hover:bg-white/10'
    }`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  }

  onSelect(eventOrId: Event | string, maybeId?: string): void {
    const id = typeof eventOrId === 'string' ? eventOrId : (maybeId as string);
    if (eventOrId instanceof Event) {
      eventOrId.stopPropagation();
      eventOrId.preventDefault();
    }
    this.select.emit(id);
  }

  onLike(event: Event, id: string): void {
    event.stopPropagation();
    event.preventDefault();
    this.like.emit(id);
  }

  onBookmark(event: Event, id: string): void {
    event.stopPropagation();
    event.preventDefault();
    this.bookmark.emit(id);
  }
}
