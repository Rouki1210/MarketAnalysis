export interface Author {
  id: number; 
  username: string;
  displayName: string;
  avatarEmoji?: string;
  verified?: boolean;
}

export interface Topic {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description?: string;
}

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

export interface CreatePostData {
  title: string;
  content: string;
  tags?: string[];
  topicIds?: number[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasPrevious: boolean;
  hasNext: boolean;
}