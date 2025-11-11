export interface Author {
  id: string;
  username: string;
  avatar: string;
  verified?: boolean;
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
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  category: 'Coin' | 'Market' | 'Education';
  sourceUrl?: string;
  content?: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  tags?: string[];
}

