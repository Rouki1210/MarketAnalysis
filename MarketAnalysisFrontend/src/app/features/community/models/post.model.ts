/**
 * Community Post Models
 *
 * Data structures for community posts, articles, and discussions
 */

/** User author information */
export interface Author {
  id: number;
  username: string;
  displayName: string;
  avatarEmoji?: string;
  verified?: boolean;
}

/** Discussion topic/category */
export interface Topic {
  id: number;
  name: string;
  slug: string;
  icon: string;
  postCount: number;
  followersCount?: number;
  description?: string;
}

/** Community post with engagement metrics */
export interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
  likes: number;
  comments: number;
  bookmarks: number;
  shares: number;
  viewCount: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  topics?: Topic[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

/** Article/news content */
export interface Article {
  id: number;
  title: string;
  summary: string;
  category: 'Coin' | 'Market' | 'Education';
  sourceUrl?: string;
  content?: string;
  imageUrl?: string;
  viewCount: number;
  author?: Author;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
}

/** DTO for creating new post */
export interface CreatePostData {
  title: string;
  content: string;
  tags?: string[];
  topicIds?: number[];
}

/** Generic API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
