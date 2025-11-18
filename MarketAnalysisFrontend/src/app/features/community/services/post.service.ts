import { Injectable, signal } from '@angular/core';
import { Post, CreatePostData } from '../models/post.model';
import { HttpParams } from '@angular/common/http';
import { CommunityApiService } from './community-api.service';
import { ApiResponse} from '../models/post.model';
import { PaginatedResponse } from '../models/post.model';
import { tap, catchError, finalize } from 'rxjs/operators';
import {of } from 'rxjs';
import { CommunityPostDto } from './community.service';


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
    this.loadPosts(); 
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

  private maptoPost(data: CommunityPostDto): Post {
    return {
      id: data.id.toString(),
      title: data.title,
      content: data.content,
      author: {
        id: data.authorId,
        username: data.authorUsername,
        displayName: data.authorDisplayName,
        avatarEmoji: data.authorAvatarEmoji,
        verified: data.authorVerified
      },
      likes: data.likes,
      comments: data.comments,
      bookmarks: data.bookmarks,
      shares: data.shares,
      viewCount: data.viewCount,
      isPinned: data.isPinned,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      topics: data.topics,
      isLiked: data.isLiked,
      isBookmarked: data.isBookmarked
      };
}

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
          if (response.success || response.data.data) {
            const post : Post[] = response.data.data;
            this.postsSignal.set(post);
            console.log('Posts set in signal:', this.postsSignal());
          }
        }),
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

  createPost(data: CreatePostData): Post {
    const newPost: Post = {
      id: Date.now().toString(), 
      title: data.title,
      content: data.content,
      author: { id: 1, username: 'You', displayName: 'You', avatarEmoji: '👤' },
      likes: 0,
      comments: 0,
      bookmarks: 0,
      shares: 0,
      viewCount: 0,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: data.tags || [],
      isLiked: false,
      isBookmarked: false
    };

    this.postsSignal.update(posts => [newPost, ...posts]);
    return newPost;
  }

  toggleLike(postId: string): void {
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