import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommunityApiService } from './community-api.service';

/** Community user profile information */
export interface CommunityUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  verified?: boolean;
  followers: number;
  following: number;
  posts: number;
  points: number;
  joinedAt: string;
  bio?: string;
  location?: string;
  website?: string;
}

/**
 * CommunityUserService (renamed from UserService)
 *
 * Manages community user profiles and interactions
 *
 * Features:
 * - Get current user profile
 * - Get user by ID
 * - Update profile information
 * - Follow/unfollow users
 *
 * Currently uses mock data - ready for API integration
 */
@Injectable({
  providedIn: 'root',
})
export class CommunityUserService {
  constructor(private apiService: CommunityApiService) {}

  getCurrentUser(): Observable<CommunityUser> {
    // Mock data for now
    return of({
      id: '1',
      username: 'CryptoTrader',
      email: 'trader@example.com',
      avatar: '🟧',
      verified: true,
      followers: 1250,
      following: 340,
      posts: 89,
      points: 5420,
      joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      bio: 'Crypto enthusiast and blockchain developer',
      location: 'San Francisco, CA',
      website: 'https://example.com',
    });
  }

  getUserById(id: string): Observable<CommunityUser> {
    return this.apiService.get<CommunityUser>(`/users/${id}`);
  }

  updateProfile(userData: Partial<CommunityUser>): Observable<CommunityUser> {
    return this.apiService.put<CommunityUser>('/users/me', userData);
  }

  followUser(userId: string): Observable<CommunityUser> {
    return this.apiService.post<CommunityUser>(`/users/${userId}/follow`, {});
  }
}
