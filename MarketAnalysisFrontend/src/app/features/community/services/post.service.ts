import { Injectable, signal } from '@angular/core';
import { Post, CreatePostData } from '../models/post.model';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { CommunityApiService } from './community-api.service';
import { ApiResponse} from '@app/core/models/common.model';
import { PaginatedResponse } from '../models/post.model';
import { tap, catchError } from 'rxjs/operators';


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
    this.loadMockPosts();
    this.loadPosts();
  }

  private loadMockPosts(): void {
    const mockPosts: Post[] = [
      // {
      //   id: 'p1',
      //   title: 'Bitcoin hits key resistance — what is next?',
      //   content: 'BTC approaches $70k again as on-chain metrics show strong accumulation. Will bulls break through?',
      //   author: { id: 1, username: 'CryptoAnalyst', displayName: 'CryptoAnalyst', avatarEmoji: '🟧', verified: true },
      //   likes: 128,
      //   comments: 34,
      //   bookmarks: 12,
      //   shares: 9,
      //   createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      //   updatedAt: new Date().toISOString(),
      //   tags: ['BTC', 'Market'],
      //   isLiked: false,
      //   isBookmarked: false
      // },
      // {
      //   id: 'p2',
      //   title: 'ETH staking update and L2 momentum',
      //   content: 'Ethereum staking continues to grow while L2 activity sets new highs. Key protocols to watch.',
      //   author: { id: 2, username: 'DeFiWatcher', avatarEmoji: '🟪' },
      //   likes: 76,
      //   comments: 18,
      //   bookmarks: 8,
      //   shares: 5,
      //   createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      //   updatedAt: new Date().toISOString(),
      //   tags: ['ETH', 'DeFi'],
      //   isLiked: false,
      //   isBookmarked: false
      // },
      // {
      //   id: 'p3',
      //   title: 'Altcoin season indicators heating up',
      //   content: 'Several metrics suggest altcoins may be gearing up for a strong run. Here is what to watch.',
      //   author: { id: 3, username: 'AltcoinGuru', avatarEmoji: '🟩', verified: true },
      //   likes: 92,
      //   comments: 27,
      //   bookmarks: 15,
      //   shares: 11,
      //   createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      //   updatedAt: new Date().toISOString(),
      //   tags: ['Altcoins', 'Market'],
      //   isLiked: false,
      //   isBookmarked: false
      // }
    ];

    this.postsSignal.set(mockPosts);
  }

  getPosts(): Post[] {
    this.loadPosts();
    return this.postsSignal();
  }

  loadPosts(page: number = 1, pageSize: number = 10, sortBy: string = 'createdAt'): void {
    // This is a mock implementation. Replace with actual API call.
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy);

    this.apiService.get<ApiResponse<PaginatedResponse<Post>>>('/CommunityPost', { params })
      .pipe(
        tap(response => {
          if (response && response.data?.data) {
            console.log('Posts loaded:', response);
            this.postsSignal.set(response.data.data);
          }
          this.loadingSignal.set(false);
        }),
        // catchError(error => {
        //   console.error('Error loading posts:', error);
        //   this.errorSignal.set(error.message || 'Failed to load posts');
        //   this.loadingSignal.set(false);
        //   // Fallback to mock data
        //   this.loadMockPosts();
        //   return null;
        // })
      ).subscribe();
  }

  getPostById(id: string): Post | undefined {
    return this.postsSignal().find(p => p.id === id);
  }

  createPost(data: CreatePostData): Post {
    const newPost: Post = {
      id: `p${Date.now()}`,
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
    this.postsSignal.update(posts => posts.filter(p => p.id !== postId));
  }
}

