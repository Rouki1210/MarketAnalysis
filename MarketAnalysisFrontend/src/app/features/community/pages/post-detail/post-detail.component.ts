import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Import services and models
import {
  CommunityService,
  CommentDto,
  CreateCommentDto,
} from '../../services/community.service';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { AvatarComponent } from '../../components/common/avatar.component';

/**
 * TopicDetailComponent (Post Detail Page)
 *
 * Full post detail page with comments
 *
 * Features:
 * - Complete post display with author info
 * - Like/bookmark/view count interactions
 * - Comments section with add/view functionality
 * - Optimistic UI updates for like/bookmark
 * - Automatic rollback on errors
 * - Real-time comment count updates
 * - Loading states for post, comments, and actions
 * - Computed CSS classes for like/bookmark states
 * - Time ago formatting for dates
 *
 * This is one of the most complex pages (425 lines) with full CRUD functionality
 */
@Component({
  selector: 'app-topic-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AvatarComponent],
  template: `
    <ng-container *ngIf="!loading() && post(); else loadingTemplate">
      <!-- Back Button -->
      <button
        (click)="goBack()"
        class="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6"
      >
        <svg
          class="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span>Back</span>
      </button>

      <article class="space-y-6">
        <!-- Post Content -->
        <div
          class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
        >
          <!-- Author Info -->
          <div class="flex items-center gap-3 mb-4">
            <app-avatar
              [emoji]="post()?.author?.avatarEmoji"
              size="md"
              [verified]="post()?.author?.verified || false"
            >
            </app-avatar>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-white font-semibold">{{
                  post()?.author?.username
                }}</span>
                <span
                  *ngIf="post()?.author?.verified"
                  class="text-blue-400 text-sm"
                  >✓</span
                >
              </div>
              <span class="text-gray-400 text-sm">{{
                formatDate(post()?.createdAt || '')
              }}</span>
            </div>
          </div>

          <h1 class="text-2xl font-bold text-white mb-3">
            {{ post()?.title }}
          </h1>
          <p class="text-gray-200 leading-relaxed mb-4">
            {{ post()?.content }}
          </p>

          <!-- Tags -->
          <div
            class="flex flex-wrap gap-2 mb-4"
            *ngIf="post()?.tags && post()!.tags!.length > 0"
          >
            <span
              *ngFor="let tag of post()?.tags"
              class="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- Action Buttons -->
          <div
            class="flex items-center gap-4 pt-4 border-t border-purple-500/20"
          >
            <button
              (click)="toggleLike()"
              [class]="likeClasses()"
              [disabled]="actionLoading()"
            >
              <span class="mr-1">{{ post()?.isLiked ? '❤️' : '🤍' }}</span>
              {{ post()?.likes }}
            </button>

            <button
              class="flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-gray-400 cursor-default"
            >
              <span class="mr-1">💬</span>
              {{ comments().length }}
            </button>

            <button
              (click)="toggleBookmark()"
              [class]="bookmarkClasses()"
              [disabled]="actionLoading()"
            >
              <span class="mr-1">{{ post()?.isBookmarked ? '🔖' : '📖' }}</span>
              {{ post()?.bookmarks }}
            </button>

            <button
              class="flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-white/10"
            >
              <span class="mr-1">👁️</span>
              {{ post()?.viewCount }}
            </button>
          </div>
        </div>

        <!-- Comments Section -->
        <section
          class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
        >
          <h2 class="text-white font-semibold text-xl mb-4">
            Comments ({{ comments().length }})
          </h2>

          <!-- Add Comment Form -->
          <form (submit)="addComment($event)" class="mb-6">
            <div class="flex items-start gap-3">
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl flex-shrink-0"
              >
                🫵
              </div>
              <div class="flex-1">
                <textarea
                  [(ngModel)]="newComment"
                  name="comment"
                  rows="3"
                  placeholder="Write a comment..."
                  class="w-full bg-black/30 border border-purple-500/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 outline-none focus:border-purple-500 resize-none"
                  [disabled]="commentLoading()"
                ></textarea>
                <div class="flex justify-end mt-2">
                  <button
                    type="submit"
                    class="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    [disabled]="!newComment.trim() || commentLoading()"
                  >
                    {{ commentLoading() ? 'Posting...' : 'Post Comment' }}
                  </button>
                </div>
              </div>
            </div>
          </form>

          <!-- Comments List -->
          <div class="space-y-4" *ngIf="comments().length > 0">
            <div
              *ngFor="let comment of comments()"
              class="flex items-start gap-3 p-4 bg-black/20 rounded-lg"
            >
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl flex-shrink-0"
              >
                {{ comment.avatarEmoji || '👤' }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-white font-medium">{{
                    comment.username
                  }}</span>
                  <span class="text-gray-400 text-xs">{{
                    formatDate(comment.createdAt)
                  }}</span>
                </div>
                <p class="text-gray-200 leading-relaxed">
                  {{ comment.content }}
                </p>
              </div>
            </div>
          </div>

          <!-- No Comments -->
          <div
            *ngIf="comments().length === 0 && !commentsLoading()"
            class="text-center py-8"
          >
            <div class="text-4xl mb-2">💬</div>
            <p class="text-gray-400">
              No comments yet. Be the first to comment!
            </p>
          </div>

          <!-- Loading Comments -->
          <div *ngIf="commentsLoading()" class="text-center py-8">
            <p class="text-gray-400">Loading comments...</p>
          </div>
        </section>
      </article>
    </ng-container>

    <!-- Loading Template -->
    <ng-template #loadingTemplate>
      <div *ngIf="loading()" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"
        ></div>
        <p class="text-gray-400">Loading post...</p>
      </div>

      <div *ngIf="!loading() && !post()" class="text-center py-12">
        <div class="text-6xl mb-4">📭</div>
        <h2 class="text-2xl text-white font-semibold mb-2">Post not found</h2>
        <p class="text-gray-400 mb-6">
          The post you are looking for does not exist.
        </p>
        <button
          (click)="goBack()"
          class="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium"
        >
          Go Back
        </button>
      </div>
    </ng-template>
  `,
  styles: [],
})
export class TopicDetailComponent implements OnInit {
  // Main data
  post = signal<Post | null>(null);
  comments = signal<CommentDto[]>([]);
  newComment = '';

  // Loading states
  loading = signal(false);
  commentsLoading = signal(false);
  commentLoading = signal(false);
  actionLoading = signal(false);
  error = signal<string | null>(null);

  // Post ID from URL
  postId: number = 0;

  // Computed properties for CSS classes
  likeClasses = computed(() => {
    const isLiked = this.post()?.isLiked;
    return `flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
      isLiked
        ? 'text-red-400 bg-red-400/10'
        : 'text-gray-400 hover:text-white hover:bg-white/10'
    }`;
  });

  bookmarkClasses = computed(() => {
    const isBookmarked = this.post()?.isBookmarked;
    return `flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
      isBookmarked
        ? 'text-yellow-400 bg-yellow-400/10'
        : 'text-gray-400 hover:text-white hover:bg-white/10'
    }`;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private communityService: CommunityService,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.postId = parseInt(idParam, 10);
      if (!isNaN(this.postId)) {
        this.loadPost();
        this.loadComments();
      } else {
        this.error.set('Invalid post ID');
      }
    }
  }

  loadPost(): void {
    this.loading.set(true);
    this.error.set(null);

    this.communityService.getPostById(this.postId).subscribe({
      next: (postDto) => {
        // Map DTO to Post model
        const post: Post = {
          id: postDto.id.toString(),
          title: postDto.title,
          content: postDto.content,
          author: {
            id: postDto.authorId,
            username: postDto.authorUsername,
            displayName: postDto.authorDisplayName,
            avatarEmoji: postDto.authorAvatarEmoji,
            verified: postDto.authorVerified,
          },
          likes: postDto.likes,
          comments: postDto.comments,
          bookmarks: postDto.bookmarks,
          shares: postDto.shares,
          viewCount: postDto.viewCount,
          isPinned: postDto.isPinned,
          createdAt: postDto.createdAt,
          updatedAt: postDto.updatedAt,
          tags: [],
          topics: postDto.topics,
          isLiked: postDto.isLiked,
          isBookmarked: postDto.isBookmarked,
        };

        this.post.set(post);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading post:', err);
        this.error.set(err.message || 'Failed to load post');
        this.loading.set(false);
      },
    });
  }

  loadComments(): void {
    this.commentsLoading.set(true);

    this.communityService.getPostComments(this.postId).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.commentsLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.commentsLoading.set(false);
      },
    });
  }

  addComment(event: Event): void {
    event.preventDefault();
    const text = this.newComment.trim();
    if (!text) return;

    this.commentLoading.set(true);

    const commentDto: CreateCommentDto = {
      postId: this.postId,
      content: text,
    };

    this.communityService.createComment(commentDto).subscribe({
      next: (newComment) => {
        this.comments.update((comments) => [newComment, ...comments]);

        this.post.update((post) => {
          if (post) {
            return { ...post, comments: post.comments + 1 };
          }
          return post;
        });

        this.newComment = '';
        this.commentLoading.set(false);
      },
      error: (err) => {
        console.error('Error creating comment:', err);
        alert('Failed to post comment. Please try again.');
        this.commentLoading.set(false);
      },
    });
  }

  toggleLike(): void {
    if (this.actionLoading()) return;

    const wasLiked = this.post()?.isLiked || false;
    const currentLikes = this.post()?.likes || 0;

    // Optimistic update
    this.post.update((post) => {
      if (post) {
        return {
          ...post,
          isLiked: !wasLiked,
          likes: wasLiked ? currentLikes - 1 : currentLikes + 1,
        };
      }
      return post;
    });

    this.actionLoading.set(true);

    this.communityService.toggleLike(this.postId).subscribe({
      next: () => {
        this.actionLoading.set(false);
      },
      error: (err) => {
        console.error('Error toggling like:', err);

        // Rollback on error
        this.post.update((post) => {
          if (post) {
            return {
              ...post,
              isLiked: wasLiked,
              likes: currentLikes,
            };
          }
          return post;
        });

        this.actionLoading.set(false);
      },
    });
  }

  toggleBookmark(): void {
    if (this.actionLoading()) return;

    const wasBookmarked = this.post()?.isBookmarked || false;
    const currentBookmarks = this.post()?.bookmarks || 0;

    // Optimistic update
    this.post.update((post) => {
      if (post) {
        return {
          ...post,
          isBookmarked: !wasBookmarked,
          bookmarks: wasBookmarked
            ? currentBookmarks - 1
            : currentBookmarks + 1,
        };
      }
      return post;
    });

    this.actionLoading.set(true);

    this.communityService.toggleBookmark(this.postId).subscribe({
      next: () => {
        this.actionLoading.set(false);
      },
      error: (err) => {
        console.error('Error toggling bookmark:', err);

        // Rollback
        this.post.update((post) => {
          if (post) {
            return {
              ...post,
              isBookmarked: wasBookmarked,
              bookmarks: currentBookmarks,
            };
          }
          return post;
        });

        this.actionLoading.set(false);
      },
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(['/community/feed']);
  }
}
