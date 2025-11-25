import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommunityApiService } from './community-api.service';
import {
    ApiResponse,
    PaginatedResponse,
    Article,
    Topic,
    Author
} from '../models/post.model';

// ==================== DTOs for API Requests ====================

export interface CreatePostDto {
    title: string;
    content: string;
    topicIds?: number[];
}

export interface UpdatePostDto {
    title?: string;
    content?: string;
    topicIds?: number[];
}

export interface CreateCommentDto {
    postId: number;
    content: string;
}

export interface UpdateCommentDto {
    content: string;
}

export interface CreateArticleDto {
    title: string;
    summary: string;
    category: 'Coin' | 'Market' | 'Education';
    content?: string;
    imageUrl?: string;
    sourceUrl?: string;
}

export interface UpdateArticleDto {
    title?: string;
    summary?: string;
    category?: 'Coin' | 'Market' | 'Education';
    content?: string;
    imageUrl?: string;
    sourceUrl?: string;
}

export interface CreateTopicDto {
    name: string;
    slug?: string;
    icon?: string;
    description?: string;
}

export interface UpdateTopicDto {
    name?: string;
    slug?: string;
    icon?: string;
    description?: string;
}

// ==================== DTOs for API Responses ====================

export interface CommunityPostDto {
    id: number;
    title: string;
    content: string;
    authorId: number;
    authorUsername: string;
    authorDisplayName: string;
    authorAvatarEmoji?: string;
    authorVerified: boolean;
    likes: number;
    comments: number;
    bookmarks: number;
    shares: number;
    viewCount: number;
    isPinned: boolean;
    isLiked: boolean;
    isBookmarked: boolean;
    createdAt: string;
    updatedAt: string;
    topics?: Topic[];
}

export interface CommentDto {
    id: number;
    postId: number;
    userId: number;
    username: string;
    avatarEmoji?: string;
    content: string;
    parentCommentId?: number;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationDto {
    id: number;
    userId: number;
    type: 'Comment' | 'Like' | 'Follow';
    message: string;
    relatedEntityId?: number;
    relatedEntityType?: string;
    isRead: boolean;
    createdAt: string;
}

export interface UserFollowDto {
    userId: number;
    username: string;
    displayName: string;
    avatarEmoji?: string;
    verified: boolean;
    isFollowing: boolean;
}

export interface FollowStatsDto {
    followerCount: number;
    followingCount: number;
}

export interface PaginationRequest {
    page?: number;
    pageSize?: number;
    sortBy?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CommunityService {
    constructor(private api: CommunityApiService) { }

    // ==================== COMMUNITY POSTS ====================

    /**
     * Get paginated list of community posts
     */
    getPosts(request: PaginationRequest = {}): Observable<PaginatedResponse<CommunityPostDto>> {
        const params = {
            page: request.page || 1,
            pageSize: request.pageSize || 15,
            sortBy: request.sortBy || 'createdAt'
        };
        return this.api.get<PaginatedResponse<CommunityPostDto>>('/CommunityPost', params);
    }

    /**
     * Get a single post by ID
     */
    getPostById(id: number): Observable<CommunityPostDto> {
        return this.api.get<ApiResponse<CommunityPostDto>>(`/CommunityPost/${id}`)
            .pipe(map(response => response.data));
    }

    /**
     * Get trending posts
     */
    getTrendingPosts(hours: number = 24, limit: number = 10): Observable<CommunityPostDto[]> {
        return this.api.get<ApiResponse<CommunityPostDto[]>>('/CommunityPost/trending', { hours, limit })
            .pipe(map(response => response.data));
    }

    /**
     * Get posts by user
     */
    getUserPosts(userId: number, page: number = 1, pageSize: number = 15): Observable<PaginatedResponse<CommunityPostDto>> {
        return this.api.get<ApiResponse<PaginatedResponse<CommunityPostDto>>>(`/CommunityPost/user/${userId}`, { page, pageSize })
            .pipe(map(response => response.data));
    }

    /**
     * Get posts by topic
     */
    getPostsByTopic(topicId: number, page: number = 1, pageSize: number = 15): Observable<PaginatedResponse<CommunityPostDto>> {
        return this.api.get<ApiResponse<PaginatedResponse<CommunityPostDto>>>(`/CommunityPost/topic/${topicId}`, { page, pageSize })
            .pipe(map(response => response.data));
    }

    /**
     * Create a new post
     */
    createPost(dto: CreatePostDto): Observable<CommunityPostDto> {
        return this.api.post<ApiResponse<CommunityPostDto>>('/CommunityPost', dto)
            .pipe(map(response => response.data));
    }

    /**
     * Update a post
     */
    updatePost(id: number, dto: UpdatePostDto): Observable<CommunityPostDto> {
        return this.api.put<ApiResponse<CommunityPostDto>>(`/CommunityPost/${id}`, dto)
            .pipe(map(response => response.data));
    }

    /**
     * Delete a post
     */
    deletePost(id: number): Observable<boolean> {
        return this.api.delete<ApiResponse<boolean>>(`/CommunityPost/${id}`)
            .pipe(map(response => response.data));
    }

    /**
     * Toggle like on a post
     */
    toggleLike(postId: number): Observable<boolean> {
        return this.api.post<ApiResponse<boolean>>(`/CommunityPost/${postId}/like`, {})
            .pipe(map(response => response.data));
    }

    /**
     * Toggle bookmark on a post
     */
    toggleBookmark(postId: number): Observable<boolean> {
        return this.api.post<ApiResponse<boolean>>(`/CommunityPost/${postId}/bookmark`, {})
            .pipe(map(response => response.data));
    }

    /**
     * Toggle pin on a post (Admin only)
     */
    togglePin(postId: number): Observable<boolean> {
        return this.api.post<ApiResponse<boolean>>(`/CommunityPost/${postId}/pin`, {})
            .pipe(map(response => response.data));
    }

    // ==================== COMMENTS ====================

    /**
     * Get comments for a post
     */
    getPostComments(postId: number, page: number = 1, pageSize: number = 50): Observable<CommentDto[]> {
        return this.api.get<ApiResponse<CommentDto[]>>(`/Comment/post/${postId}`, { page, pageSize })
            .pipe(map(response => response.data));
    }

    /**
     * Get comments by user
     */
    getUserComments(userId: number, page: number = 1, pageSize: number = 15): Observable<CommentDto[]> {
        return this.api.get<ApiResponse<CommentDto[]>>(`/Comment/user/${userId}`, { page, pageSize })
            .pipe(map(response => response.data));
    }

    /**
     * Get a single comment
     */
    getCommentById(id: number): Observable<CommentDto> {
        return this.api.get<ApiResponse<CommentDto>>(`/Comment/${id}`)
            .pipe(map(response => response.data));
    }

    /**
     * Create a comment
     */
    createComment(dto: CreateCommentDto): Observable<CommentDto> {
        return this.api.post<ApiResponse<CommentDto>>('/Comment', dto)
            .pipe(map(response => response.data));
    }

    /**
     * Update a comment
     */
    updateComment(id: number, dto: UpdateCommentDto): Observable<CommentDto> {
        return this.api.put<ApiResponse<CommentDto>>(`/Comment/${id}`, dto)
            .pipe(map(response => response.data));
    }

    /**
     * Delete a comment
     */
    deleteComment(id: number): Observable<boolean> {
        return this.api.delete<ApiResponse<boolean>>(`/Comment/${id}`)
            .pipe(map(response => response.data));
    }

    // ==================== ARTICLES ====================

    /**
     * Get paginated list of articles
     */
    getArticles(page: number = 1, pageSize: number = 15): Observable<PaginatedResponse<Article>> {
        return this.api.get<ApiResponse<PaginatedResponse<Article>>>('/Articles', { page, pageSize })
            .pipe(map(response => response.data));
    }

    /**
     * Get a single article
     */
    getArticleById(id: number): Observable<Article> {
        return this.api.get<ApiResponse<Article>>(`/Articles/${id}`)
            .pipe(map(response => response.data));
    }

    /**
     * Get articles by category
     */
    getArticlesByCategory(category: string, page: number = 1, pageSize: number = 15): Observable<PaginatedResponse<Article>> {
        return this.api.get<ApiResponse<PaginatedResponse<Article>>>(`/Articles/category/${category}`, { page, pageSize })
            .pipe(map(response => response.data));
    }

    /**
     * Get available article categories
     */
    getArticleCategories(): Observable<string[]> {
        return this.api.get<ApiResponse<string[]>>('/Articles/categories')
            .pipe(map(response => response.data));
    }

    /**
     * Create an article (Admin only)
     */
    createArticle(dto: CreateArticleDto): Observable<Article> {
        return this.api.post<ApiResponse<Article>>('/Articles', dto)
            .pipe(map(response => response.data));
    }

    /**
     * Update an article (Admin only)
     */
    updateArticle(id: number, dto: UpdateArticleDto): Observable<Article> {
        return this.api.put<ApiResponse<Article>>(`/Articles/${id}`, dto)
            .pipe(map(response => response.data));
    }

    /**
     * Delete an article (Admin only)
     */
    deleteArticle(id: number): Observable<boolean> {
        return this.api.delete<ApiResponse<boolean>>(`/Articles/${id}`)
            .pipe(map(response => response.data));
    }

    /**
     * Increment article view count
     */
    incrementArticleView(id: number): Observable<number> {
        return this.api.post<ApiResponse<number>>(`/Articles/${id}/view`, {})
            .pipe(map(response => response.data));
    }

    // ==================== TOPICS ====================

    /**
     * Get all topics
     */
    getAllTopics(): Observable<Topic[]> {
        return this.api.get<ApiResponse<Topic[]>>('/Topic')
            .pipe(map(response => response.data));
    }

    /**
     * Get popular topics
     */
    getPopularTopics(limit: number = 10): Observable<Topic[]> {
        return this.api.get<ApiResponse<Topic[]>>('/Topic/popular', { limit })
            .pipe(map(response => response.data));
    }

    /**
     * Get a single topic by ID
     */
    getTopicById(id: number): Observable<Topic> {
        return this.api.get<ApiResponse<Topic>>(`/Topic/${id}`)
            .pipe(map(response => response.data));
    }

    /**
     * Get a topic by slug
     */
    getTopicBySlug(slug: string): Observable<Topic> {
        return this.api.get<ApiResponse<Topic>>(`/Topic/slug/${slug}`)
            .pipe(map(response => response.data));
    }

    /**
     * Get posts for a topic
     */
    getTopicPosts(topicId: number, page: number = 1, pageSize: number = 15): Observable<PaginatedResponse<CommunityPostDto>> {
        return this.api.get<ApiResponse<PaginatedResponse<CommunityPostDto>>>(`/Topic/${topicId}/posts`, { page, pageSize })
            .pipe(map(response => response.data));
    }

    /**
     * Create a topic (Admin only)
     */
    createTopic(dto: CreateTopicDto): Observable<Topic> {
        return this.api.post<ApiResponse<Topic>>('/Topic', dto)
            .pipe(map(response => response.data));
    }

    /**
     * Update a topic (Admin only)
     */
    updateTopic(id: number, dto: UpdateTopicDto): Observable<Topic> {
        return this.api.put<ApiResponse<Topic>>(`/Topic/${id}`, dto)
            .pipe(map(response => response.data));
    }

    /**
     * Delete a topic (Admin only)
     */
    deleteTopic(id: number): Observable<boolean> {
        return this.api.delete<ApiResponse<boolean>>(`/Topic/${id}`)
            .pipe(map(response => response.data));
    }

    /**
     * Follow a topic
     */
    followTopic(topicId: number): Observable<boolean> {
        return this.api.post<ApiResponse<boolean>>(`/Topic/${topicId}/follow`, {})
            .pipe(map(response => response.data));
    }

    /**
     * Unfollow a topic
     */
    unfollowTopic(topicId: number): Observable<boolean> {
        return this.api.delete<ApiResponse<boolean>>(`/Topic/${topicId}/follow`)
            .pipe(map(response => response.data));
    }

    /**
     * Check if following a topic
     */
    isFollowingTopic(topicId: number): Observable<boolean> {
        return this.api.get<ApiResponse<boolean>>(`/Topic/${topicId}/is-following`)
            .pipe(map(response => response.data));
    }

    // ==================== NOTIFICATIONS ====================

    /**
     * Get user notifications
     */
    getNotifications(page: number = 1, pageSize: number = 20): Observable<NotificationDto[]> {
        return this.api.get<ApiResponse<NotificationDto[]>>('/Notification', { page, pageSize })
            .pipe(map(response => response.data));
    }

    /**
     * Get unread notification count
     */
    getUnreadCount(): Observable<number> {
        return this.api.get<ApiResponse<number>>('/Notification/unread-count')
            .pipe(map(response => response.data));
    }

    /**
     * Mark notification as read
     */
    markNotificationAsRead(id: number): Observable<boolean> {
        return this.api.put<ApiResponse<boolean>>(`/Notification/${id}/mark-read`, {})
            .pipe(map(response => response.data));
    }

    /**
     * Mark all notifications as read
     */
    markAllNotificationsAsRead(): Observable<boolean> {
        return this.api.put<ApiResponse<boolean>>('/Notification/mark-all-read', {})
            .pipe(map(response => response.data));
    }

    /**
     * Delete a notification
     */
    deleteNotification(id: number): Observable<boolean> {
        return this.api.delete<ApiResponse<boolean>>(`/Notification/${id}`)
            .pipe(map(response => response.data));
    }

    /**
     * Get notification types
     */
    getNotificationTypes(): Observable<string[]> {
        return this.api.get<ApiResponse<string[]>>('/Notification/types')
            .pipe(map(response => response.data));
    }

    // ==================== USER FOLLOWS ====================

    /**
     * Follow a user
     */
    followUser(userId: number): Observable<boolean> {
        return this.api.post<ApiResponse<boolean>>(`/UserFollows/${userId}`, {})
            .pipe(map(response => response.data));
    }

    /**
     * Unfollow a user
     */
    unfollowUser(userId: number): Observable<boolean> {
        return this.api.delete<ApiResponse<boolean>>(`/UserFollows/${userId}`)
            .pipe(map(response => response.data));
    }

    /**
     * Check if following a user
     */
    isFollowingUser(userId: number): Observable<boolean> {
        return this.api.get<ApiResponse<boolean>>(`/UserFollows/${userId}/is-following`)
            .pipe(map(response => response.data));
    }

    /**
     * Get user's followers
     */
    getUserFollowers(userId: number, page: number = 1, pageSize: number = 20): Observable<UserFollowDto[]> {
        return this.api.get<ApiResponse<UserFollowDto[]>>(`/UserFollows/${userId}/follower`, { page, pageSize })
            .pipe(map(response => response.data));
    }

    /**
     * Get users that a user is following
     */
    getUserFollowing(userId: number, page: number = 1, pageSize: number = 20): Observable<UserFollowDto[]> {
        return this.api.get<ApiResponse<UserFollowDto[]>>(`/UserFollows/${userId}/following`, { page, pageSize })
            .pipe(map(response => response.data));
    }

    /**
     * Get follow statistics
     */
    getFollowStats(userId: number): Observable<FollowStatsDto> {
        return this.api.get<ApiResponse<FollowStatsDto>>(`/UserFollows/${userId}/stats`)
            .pipe(map(response => response.data));
    }
}