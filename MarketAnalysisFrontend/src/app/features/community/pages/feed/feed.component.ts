import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post, CreatePostData } from '../../models/post.model';
import { ModalService } from '../../services/modal.service';
import { CreatePostComponent } from '../../components/feed/create-post.component';
import { FilterBarComponent } from '../../components/feed/filter-bar.component';
import { PostListComponent } from '../../components/feed/post-list.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, CreatePostComponent, FilterBarComponent, PostListComponent],
  template: `
    <div>
      <!-- Create Post Modal -->
      <app-create-post
        *ngIf="showCreatePost()"
        (submit)="onCreatePost($event)"
        (close)="onCloseModal()">
      </app-create-post>

      <!-- Filter Bar -->
      <app-filter-bar
        [selectedFilter]="selectedFilter()"
        (filterChange)="onFilterChange($event)">
      </app-filter-bar>

      <!-- Posts List -->
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
export class FeedComponent implements OnInit {
  posts = signal<Post[]>([]);
  selectedFilter = signal<string>('trending');
  showCreatePost = signal<boolean>(false);
  loading = signal<boolean>(false);

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
    this.posts.set(this.postService.getPosts());
    this.loading.set(false);
  }

  onFilterChange(filter: string): void {
    this.selectedFilter.set(filter);
    // Filter logic can be added here
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

