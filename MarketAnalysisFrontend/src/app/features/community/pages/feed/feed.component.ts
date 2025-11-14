import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post, CreatePostData } from '../../models/post.model';
import { ModalService } from '../../services/modal.service';
import { CreatePostComponent } from '../../components/feed/create-post.component';
import { FilterBarComponent } from '../../components/feed/filter-bar.component';
import { PostListComponent } from '../../components/feed/post-list.component';
import { SearchBarComponent } from '../../components/common/search-bar.component';
import { ButtonComponent } from '../../components/common/button.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, CreatePostComponent, FilterBarComponent, PostListComponent, SearchBarComponent, ButtonComponent],
  template: `
    <div>
      <!-- Create Post Modal -->
      <app-create-post
        *ngIf="showCreatePost()"
        (submit)="onCreatePost($event)"
        (close)="onCloseModal()">
      </app-create-post>

      <!-- Search Bar and Create Post Button -->
      <div class="mb-6 flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4">
        <div class="flex-1">
          <app-search-bar
            [value]="searchQuery()"
            (valueChange)="onSearchChange($event)"
            placeholder="Search discussions..."
            className="w-full">
          </app-search-bar>
        </div>
        <app-button (onClick)="onCreatePostClick()">Create Post</app-button>
      </div>

      <!-- Filter Bar -->
      <app-filter-bar
        [selectedFilter]="selectedFilter()"
        (filterChange)="onFilterChange($event)">
      </app-filter-bar>

      <!-- Posts List -->
      <app-post-list
        [posts]="filteredPosts()"
        [loading]="loading()"
        (like)="onLike($event)"
        (bookmark)="onBookmark($event)"
        (select)="onSelectPost($event)">
      </app-post-list>
    </div>
  `,
  styles: []
})
export class FeedComponent implements OnInit {
  posts = signal<Post[]>([]);
  selectedFilter = signal<string>('trending');
  showCreatePost = signal<boolean>(false);
  loading = signal<boolean>(false);
  searchQuery = signal<string>('');
  filteredPosts = signal<Post[]>([]);

  constructor(
    private postService: PostService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPosts();

    // Subscribe to modal service
    this.modalService.showCreatePost$.subscribe(show => {
      this.showCreatePost.set(show);
    });
  }

  loadPosts(): void {
    this.loading.set(true);
    const allPosts = this.postService.getPosts();
    this.posts.set(allPosts);
    this.filterPosts();
    this.loading.set(false);
  }

  filterPosts(): void {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      this.filteredPosts.set(this.posts());
      return;
    }
    const filtered = this.posts().filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.author.username.toLowerCase().includes(query)
    );
    this.filteredPosts.set(filtered);
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.filterPosts();
  }

  onCreatePostClick(): void {
    this.modalService.openCreatePost();
  }

  onFilterChange(filter: string): void {
    this.selectedFilter.set(filter);
    this.filterPosts();
  }

  onCreatePost(postData: Partial<Post>): void {
    if (postData.title && postData.content) {
      this.postService.createPost({
        title: postData.title,
        content: postData.content,
        tags: postData.tags || []
      });
      this.modalService.closeCreatePost();
      this.loadPosts();
    }
  }

  onCloseModal(): void {
    this.modalService.closeCreatePost();
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

