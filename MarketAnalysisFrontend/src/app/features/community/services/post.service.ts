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

    return this.apiService.post<ApiResponse<Post>>('/communitypost', data)
      .pipe(
        tap(response => {
          console.log('✅ Post created:', response);
          
          if (response.success && response.data) {
            const post = this.mapPost(response.data);
            // Add to beginning of list
            this.postsSignal.update(posts => [post, ...posts]);
          }
        }),
        catchError(error => {
          console.error('❌ Error creating post:', error);
          this.errorSignal.set(error.message || 'Failed to create post');
          throw error;
        }),
        tap(() => {
          this.loadingSignal.set(false);
        })
      );
  }

  toggleLike(postId: string): void {
    const currentPost = this.getPostById(postId);
    if(!currentPost) return;
    
    const wasLiked = currentPost.isLiked;

    this.postsSignal.update(posts =>
      posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !wasLiked,
            likes: wasLiked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      })
    );

    this.apiService.post<ApiResponse<boolean>>(`/communitypost/${postId}/like`, {})
    .pipe(
      tap(response => {
        console.log('✅ Toggled like:', response);
      }),
      catchError(error => {
          console.error('❌ Error toggling like:', error);
          
          // Revert on error
          this.postsSignal.update(posts =>
            posts.map(post => {
              if (post.id === postId) {
                return {
                  ...post,
                  isLiked: wasLiked,
                  likes: wasLiked ? post.likes + 1 : post.likes - 1
                };
              }
              return post;
            })
          );
          
          this.errorSignal.set(error.message || 'Failed to toggle like');
          return of(null);
        })
      ).subscribe();
  }

  toggleBookmark(postId: string): void {
    const currentPost = this.getPostById(postId);
    if (!currentPost) return;

    const wasBookmarked = currentPost.isBookmarked || false;
    this.postsSignal.update(posts =>
      posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isBookmarked: !wasBookmarked,
            bookmarks: wasBookmarked ? post.bookmarks - 1 : post.bookmarks + 1
          };
        }
        return post;
      })
    );

    this.apiService.post<ApiResponse<boolean>>(`/communitypost/${postId}/bookmark`, {})
      .pipe(
        tap(response => {
          console.log('✅ Bookmark toggled:', response);
        }),
        catchError(error => {
          console.error('❌ Error toggling bookmark:', error);
          
          // Revert on error
          this.postsSignal.update(posts =>
            posts.map(post => {
              if (post.id === postId) {
                return {
                  ...post,
                  isBookmarked: wasBookmarked,
                  bookmarks: wasBookmarked ? post.bookmarks + 1 : post.bookmarks - 1
                };
              }
              return post;
            })
          );
          
          this.errorSignal.set(error.message || 'Failed to toggle bookmark');
          return of(null);
        })
      )
      .subscribe();
  }

  deletePost(postId: string): void {
    const deletedPost = this.getPostById(postId);
    this.postsSignal.update(posts => posts.filter(p => p.id !== postId));

    this.apiService.delete<ApiResponse<boolean>>(`/communitypost/${postId}`)
      .pipe(
        tap(response => {
          console.log('✅ Post deleted:', response);
        }),
        catchError(error => {
          console.error('❌ Error deleting post:', error);
          
          // Revert on error
          if (deletedPost) {
            this.postsSignal.update(posts => [deletedPost, ...posts]);
          }
          
          this.errorSignal.set(error.message || 'Failed to delete post');
          return of(null);
        })
      )
      .subscribe();
  }

  private mapPost(post: any): Post {
    return {
      id: post.id?.toString() || '',
      title: post.title || '',
      content: post.content || '',
      author: {
        id: post.authorId || 0,
        username: post.authorUsername || 'Unknown',
        displayName: post.authorDisplayName || 'Unknown User',
        avatarEmoji: post.authorAvatarEmoji || '👤',
        verified: post.authorVerified || false
      },
      likes: post.likes || 0,
      comments: post.comments || 0,
      bookmarks: post.bookmarks || 0,
      shares: post.shares || 0,
      viewCount: post.viewCount || 0,
      isPinned: post.isPinned || false,
      createdAt: post.createdAt || new Date().toISOString(),
      updatedAt: post.updatedAt || new Date().toISOString(),
      tags: post.tags || [],
      topics: post.topics || [],
      isLiked: post.isLiked || false,
      isBookmarked: post.isBookmarked || false
    };
  }

  private mapPosts(posts: any[]): Post[] {
    return posts.map(post => this.mapPost(post));
  }
}