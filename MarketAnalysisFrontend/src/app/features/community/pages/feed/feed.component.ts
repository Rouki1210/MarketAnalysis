import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { ModalService } from '../../services/modal.service';
import { CreatePostComponent } from '../../components/feed/create-post.component';
import { FilterBarComponent } from '../../components/feed/filter-bar.component';
import { PostListComponent } from '../../components/feed/post-list.component';
import { SearchBarComponent } from '../../components/common/search-bar.component';
import { ButtonComponent } from '../../components/common/button.component';

/**
 * FeedComponent
 *
 * Main community feed page displaying posts
 *
 * Features:
 * - Search bar for filtering posts
 * - Create Post button and modal
 * - Filter bar (trending/latest/top)
 * - Post list with like/bookmark/comment
 * - Real-time search filtering using computed signals
 * - Integration with PostService and ModalService
 */
@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    CreatePostComponent,
    FilterBarComponent,
    PostListComponent,
    SearchBarComponent,
    ButtonComponent,
  ],
  template: `
    <div>
      <!-- Create Post Modal -->
      <app-create-post
        *ngIf="showCreatePost()"
        (submit)="onCreatePost($event)"
        (close)="onCloseModal()"
      >
      </app-create-post>

      <!-- Search Bar -->
      <div
        class="mb-6 flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4"
      >
        <div class="flex-1">
          <app-search-bar
            [value]="searchQuery()"
            (valueChange)="onSearchChange($event)"
            placeholder="Search discussions..."
            className="w-full"
          >
          </app-search-bar>
        </div>
        <app-button (onClick)="onCreatePostClick()">Create Post</app-button>
      </div>

      <!-- Filter Bar -->
      <app-filter-bar
        [selectedFilter]="selectedFilter()"
        (filterChange)="onFilterChange($event)"
      >
      </app-filter-bar>

      <!-- Posts List -->
      <app-post-list
        [posts]="filteredPosts()"
        [loading]="postService.loading()"
        (like)="onLike($event)"
        (bookmark)="onBookmark($event)"
        (select)="onSelectPost($event)"
      >
      </app-post-list>
    </div>
  `,
})
export class FeedComponent implements OnInit {
  selectedFilter = signal<string>('trending');
  searchQuery = signal<string>('');
  showCreatePost = signal<boolean>(false);

  constructor(
    public postService: PostService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.postService.loadPosts();

    this.modalService.showCreatePost$.subscribe((show) => {
      this.showCreatePost.set(show);
    });
  }

  filteredPosts = computed(() => {
    const posts = this.postService.posts(); // lấy từ service
    const query = this.searchQuery().toLowerCase();

    if (!query) return posts;

    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author.username.toLowerCase().includes(query)
    );
  });

  onSearchChange(value: string) {
    this.searchQuery.set(value);
  }

  onCreatePostClick() {
    this.modalService.openCreatePost();
  }

  onCreatePost(postData: Partial<Post>) {
    if (postData.title && postData.content) {
      this.postService.createPost({
        title: postData.title,
        content: postData.content,
        tags: postData.tags || [],
      });
      this.modalService.closeCreatePost();
    }
  }

  onFilterChange(filter: string) {
    this.selectedFilter.set(filter);
  }

  onLike(postId: string) {
    this.postService.toggleLike(postId);
  }

  onBookmark(postId: string) {
    this.postService.toggleBookmark(postId);
  }

  onSelectPost(postId: string) {
    this.router.navigate(['/community/post', postId]);
  }

  onCloseModal() {
    this.modalService.closeCreatePost();
  }
}
