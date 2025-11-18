import { Injectable, signal } from '@angular/core';
import { Post, CreatePostData } from '../models/post.model';
import { HttpParams } from '@angular/common/http';
import { CommunityApiService } from './community-api.service';
import { ApiResponse} from '../models/post.model';
import { PaginatedResponse } from '../models/post.model';
import { tap, catchError, finalize } from 'rxjs/operators';
import {Observable, of } from 'rxjs';
import { AppComponent } from '@app/app.component';


@Injectable({
  providedIn: 'root'
})
export class PostService {
  private postsSignal = signal<Post[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  posts = this.postsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();


  constructor(private apiService: CommunityApiService) {
    this.getPosts(); 
  }

  // private loadMockPosts(): void {
  //   const mockPosts: Post[] = [
  //     {
  //       id: "1",
  //       title: 'Bitcoin hits key resistance — what is next?',
  //       content: 'BTC approaches $70k again as on-chain metrics show strong accumulation. Will bulls break through?',
  //       author: { id: 1, username: 'CryptoAnalyst', displayName: 'CryptoAnalyst', avatarEmoji: '🟧', verified: true },
  //       likes: 128,
  //       comments: 34,
  //       bookmarks: 12,
  //       shares: 9,
  //       viewCount: 102,
  //       isPinned: false,
  //       createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  //       updatedAt: new Date().toISOString(),
  //       tags: ['BTC', 'Market'],
  //       isLiked: false,
  //       isBookmarked: false
  //     },
  //     {
  //       id: Date.now().toString(),
  //       title: 'Altcoin season indicators heating up',
  //       content: 'Several metrics suggest altcoins may be gearing up for a strong run. Here is what to watch.',
  //       author: { id: 3, username: 'AltcoinGuru', displayName: 'AltcoinGuru', avatarEmoji: '🟩', verified: true },
  //       likes: 92,
  //       comments: 27,
  //       bookmarks: 15,
  //       viewCount:  97,
  //       isPinned: false,
  //       shares: 11,
  //       createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  //       updatedAt: new Date().toISOString(),
  //       tags: ['Altcoins', 'Market'],
  //       isLiked: false,
  //       isBookmarked: false
  //     }
  //   ];

  //   this.postsSignal.set(mockPosts);
  // }

  public loadPosts(page: number = 1, pageSize: number = 15, sortBy: string = 'CreatedAt'): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params = new HttpParams({
      fromObject: {
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy
      }
    });

    this.apiService.get<ApiResponse<PaginatedResponse<Post>>>('/communitypost', params)
      .pipe(
        tap(response => {
          if (!response.success || response.data?.data) {
            const post : Post[] = response.data?.data;
            this.postsSignal.set(post);
            this.loadingSignal.set(false);
          }
        }),
        catchError(error => {
          console.error('Error loading posts:', error);
          this.errorSignal.set(error.message || 'Failed to load posts');
          return of(null);
        }),
        tap(() => {
          this.loadingSignal.set(false);
        })
      )
      .subscribe(response => {
        if (!response?.data?.data) {
          return;
        }
      });
  }

  getPosts(): Post[] {
    return this.postsSignal();
  }


  getPostById(id: string): Post | undefined {
    return this.postsSignal().find(p => p.id === id);
  }

  createPost(data: CreatePostData): Observable<ApiResponse<Post>> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.apiService.post<ApiResponse<Post>>('/CommunityPost', data);
  }

  toggleLike(postId: string): void {
    const currentPost = this.getPostById(postId);
    this.postsSignal.update(posts =>
      posts.map(post => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likes: isLiked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      })
    );
  }

  toggleBookmark(postId: string): void {
    this.postsSignal.update(posts =>
      posts.map(post => {
        if (post.id === postId) {
          const isBookmarked = !post.isBookmarked;
          return {
            ...post,
            isBookmarked,
            bookmarks: isBookmarked ? post.bookmarks + 1 : post.bookmarks - 1
          };
        }
        return post;
      })
    );
  }

  deletePost(postId: string): void {
    const deletedPost = this.getPostById(postId);
    this.postsSignal.update(posts => posts.filter(p => p.id !== postId));

    this.apiService.delete<ApiResponse<boolean>>(`/CommunityPost/${postId}`).pipe(
      catchError(error => {
        console.error('Error deleting post:', error);
        if (deletedPost) {
            this.postsSignal.update(posts => [deletedPost, ...posts]);
          }
          this.errorSignal.set(error.message || 'Failed to delete post');
          return of(null);
        })
      ).subscribe();
  }

}