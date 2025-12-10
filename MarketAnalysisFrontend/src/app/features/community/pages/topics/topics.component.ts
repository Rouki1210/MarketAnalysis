import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Post } from '../../models/post.model';
import { CommunityService } from '../../services/community.service';
import { PostService } from '../../services/post.service';

/** Topic category information */
interface Topic {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description?: string;
}

/**
 * TopicsComponent
 *
 * Topics page listing categories and recent discussions
 *
 * Features:
 * - Popular topics grid display
 * - Post count per topic
 * - Recent discussions list
 * - Post navigation
 * - Loading states for topics and posts
 * - Error handling and retry
 * - Time ago formatting for posts
 */
@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Topics</h1>
          <p class="text-muted-foreground mt-1">Explore trending discussions</p>
        </div>
      </div>

      <!-- Topic Categories -->
      <div class="mb-8">
        <h2 class="text-xl font-bold text-foreground mb-4">Popular Topics</h2>

        <!-- Loading Topics -->
        <div *ngIf="topicsLoading()" class="text-center py-8">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"
          ></div>
          <p class="text-muted-foreground text-sm">Loading topics...</p>
        </div>

        <!-- Topics Grid -->
        <div
          *ngIf="!topicsLoading() && topics().length > 0"
          class="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div
            *ngFor="let topic of topics()"
            (click)="openTopic(topic.id)"
            class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer"
          >
            <div class="text-4xl mb-3">{{ topic.icon || '📌' }}</div>
            <h3 class="font-semibold text-foreground mb-1">{{ topic.name }}</h3>
            <p class="text-sm text-muted-foreground">
              {{ getPostCount(topic.id) }} posts
            </p>
          </div>
        </div>

        <!-- No Topics -->
        <div
          *ngIf="!topicsLoading() && topics().length === 0"
          class="text-center py-8"
        >
          <div class="text-4xl mb-2">📭</div>
          <p class="text-muted-foreground">No topics available</p>
        </div>
      </div>

      <!-- Recent Posts -->
      <div class="mb-4">
        <h2 class="text-2xl font-bold text-foreground mb-4">
          Recent Discussions
        </h2>
      </div>

      <!-- Loading Posts -->
      <div *ngIf="postsLoading()" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"
        ></div>
        <p class="text-muted-foreground">Loading posts...</p>
      </div>

      <!-- Posts List -->
      <div class="space-y-4" *ngIf="!postsLoading() && posts().length > 0">
        <div
          *ngFor="let post of posts()"
          (click)="openPost(post.id)"
          class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer"
        >
          <!-- Post Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl"
              >
                {{ post.author.avatarEmoji || '👤' }}
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-semibold text-foreground">{{
                    post.author.username
                  }}</span>
                  <svg
                    *ngIf="post.author.verified"
                    class="w-4 h-4 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span class="text-sm text-muted-foreground">{{
                  getTimeAgo(post.createdAt)
                }}</span>
              </div>
            </div>
          </div>

          <!-- Post Content -->
          <h3 class="text-lg font-bold text-foreground mb-2">
            {{ post.title }}
          </h3>
          <p class="text-muted-foreground mb-3 line-clamp-2">
            {{ post.content }}
          </p>

          <!-- Tags -->
          <div
            class="flex flex-wrap gap-2 mb-3"
            *ngIf="post.tags && post.tags.length > 0"
          >
            <span
              *ngFor="let tag of post.tags"
              class="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- Post Stats -->
          <div
            class="flex items-center space-x-4 text-sm text-muted-foreground"
          >
            <span class="flex items-center space-x-1">
              <svg
                class="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                ></path>
              </svg>
              <span>{{ post.likes }}</span>
            </span>
            <span class="flex items-center space-x-1">
              <svg
                class="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                ></path>
              </svg>
              <span>{{ post.comments }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- No Posts -->
      <div
        *ngIf="!postsLoading() && posts().length === 0"
        class="text-center py-12"
      >
        <div class="text-6xl mb-4">📭</div>
        <h3 class="text-xl font-semibold text-foreground mb-2">No posts yet</h3>
        <p class="text-muted-foreground">Be the first to create a post!</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="text-center py-12">
        <div class="text-6xl mb-4">⚠️</div>
        <h3 class="text-xl font-semibold text-foreground mb-2">
          Something went wrong
        </h3>
        <p class="text-muted-foreground mb-4">{{ error() }}</p>
        <button
          (click)="loadData()"
          class="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
})
export class TopicsComponent implements OnInit {
  // State - QUAN TRỌNG: Dùng signal cho reactive
  posts = signal<Post[]>([]);
  topics = signal<Topic[]>([]);
  arrayPosts: Post[] = [];

  // Loading states
  postsLoading = signal(false);
  topicsLoading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private communityService: CommunityService,
    private postService: PostService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.error.set(null);
    this.loadTopics();
    this.loadPosts();
  }

  // Load topics từ API
  loadTopics(): void {
    this.topicsLoading.set(true);

    this.communityService.getAllTopics().subscribe({
      next: (topics: Topic[]) => {
        console.log('✅ Loaded topics:', topics);
        this.topics.set(topics);
        this.topicsLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading topics:', err);
        this.topicsLoading.set(false);
      },
    });
  }

  // Load posts từ API
  loadPosts(): void {
    this.postsLoading.set(true);
    this.error.set(null);
    this.postService.loadPosts();

    const interval = setInterval(() => {
      const loadedPosts = this.postService.getPosts();
      if (loadedPosts.length > 0 || this.postService.error()) {
        this.posts.set(loadedPosts);
        this.postsLoading.set(false);

        if (this.postService.error()) {
          this.error.set('Failed to load posts. Please try again later.');
        }
        clearInterval(interval);
      }
    }, 200);
  }

  openPost(postId: string): void {
    console.log('Navigate to post:', postId);
    this.router.navigate(['/community/post', postId]);
  }

  openTopic(topicId: number): void {
    console.log('Navigate to topic:', topicId);
  }

  // Đếm số posts có topic này
  getPostCount(topicId: number): number {
    return this.posts().filter((post) =>
      post.topics?.some((t) => t.id === topicId)
    ).length;
  }

  // Format time ago
  getTimeAgo(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}
