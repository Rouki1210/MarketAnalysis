import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { PostListComponent } from '../../components/feed/post-list.component';

@Component({
  selector: 'app-trending',
  standalone: true,
  imports: [CommonModule, PostListComponent],
  template: `
    <div>
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-white mb-2">🔥 Trending Topics</h1>
        <p class="text-gray-400">Most popular discussions right now</p>
      </div>

      <app-post-list
        [posts]="posts()"
        [loading]="loading()"
        (like)="onLike($event)"
        (bookmark)="onBookmark($event)"
        (select)="onSelectPost($event)">
      </app-post-list>
    </div>
  `,
  styles: []
})
export class TrendingComponent implements OnInit {
  posts = signal<Post[]>([]);
  loading = signal<boolean>(false);

  constructor(
    private postService: PostService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading.set(true);
    // Get posts sorted by likes (trending)
    const allPosts = this.postService.getPosts();
    const trendingPosts = [...allPosts].sort((a, b) => b.likes - a.likes);
    this.posts.set(trendingPosts);
    this.loading.set(false);
  }

  onLike(postId: string): void {
    this.postService.toggleLike(postId);
    this.loadPosts();
  }

  onBookmark(postId: string): void {
    this.postService.toggleBookmark(postId);
    this.loadPosts();
  }

  onSelectPost(postId: string): void {
    this.router.navigate(['/community/post', postId]);
  }
}

