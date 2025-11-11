import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

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
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div 
          *ngFor="let topic of topics"
          class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer"
        >
          <div class="text-4xl mb-3">{{ topic.icon }}</div>
          <h3 class="font-semibold text-foreground mb-1">{{ topic.name }}</h3>
          <p class="text-sm text-muted-foreground">{{ topic.count }} posts</p>
        </div>
      </div>

      <!-- Recent Posts -->
      <div class="mb-4">
        <h2 class="text-2xl font-bold text-foreground mb-4">Recent Discussions</h2>
      </div>

      <div class="space-y-4">
        <div 
          *ngFor="let post of posts()"
          (click)="openPost(post.id)"
          class="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer"
        >
          <!-- Post Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xl">
                {{ post.author.avatar }}
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-semibold text-foreground">{{ post.author.username }}</span>
                  <svg 
                    *ngIf="post.author.verified"
                    class="w-4 h-4 text-blue-500" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span class="text-sm text-muted-foreground">{{ getTimeAgo(post.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Post Content -->
          <h3 class="text-lg font-bold text-foreground mb-2">{{ post.title }}</h3>
          <p class="text-muted-foreground mb-3 line-clamp-2">{{ post.content }}</p>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mb-3" *ngIf="post.tags && post.tags.length > 0">
            <span 
              *ngFor="let tag of post.tags"
              class="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- Post Stats -->
          <div class="flex items-center space-x-4 text-sm text-muted-foreground">
            <span class="flex items-center space-x-1">
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>{{ post.likes }}</span>
            </span>
            <span class="flex items-center space-x-1">
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>{{ post.comments }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class TopicsComponent {
  posts = signal<Post[]>([]);

  topics = [
    { name: 'Bitcoin', icon: '₿', count: 1234 },
    { name: 'Ethereum', icon: 'Ξ', count: 892 },
    { name: 'DeFi', icon: '🏦', count: 567 },
    { name: 'NFTs', icon: '🎨', count: 423 },
    { name: 'Trading', icon: '📈', count: 789 },
    { name: 'News', icon: '📰', count: 654 },
    { name: 'Education', icon: '📚', count: 321 },
    { name: 'Altcoins', icon: '🪙', count: 456 }
  ];

  constructor(
    private postService: PostService,
    private router: Router
  ) {
    this.posts.set(this.postService.getPosts());
  }

  openPost(postId: string): void {
    // Navigate to post detail or open modal
    console.log('Open post:', postId);
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}

