import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommunityApiService } from './community-api.service';

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    username: string;
    avatar?: string;
    verified?: boolean;
  };
  points: number;
  badge?: string;
  change?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  constructor(private apiService: CommunityApiService) {}

  getLeaderboard(limit: number = 50): Observable<LeaderboardEntry[]> {
    // Mock data for now
    return of(this.getMockLeaderboard(limit));
  }

  getTopContributors(limit: number = 5): Observable<LeaderboardEntry[]> {
    return of(this.getMockLeaderboard(limit));
  }

  private getMockLeaderboard(limit: number): LeaderboardEntry[] {
    const mockData: LeaderboardEntry[] = [
      { 
        rank: 1, 
        user: { id: '1', username: 'CryptoGuru', avatar: '🏆', verified: true }, 
        points: 15420, 
        badge: '🏆',
        change: 2
      },
      { 
        rank: 2, 
        user: { id: '2', username: 'BlockchainPro', avatar: '🥈', verified: true }, 
        points: 12350, 
        badge: '🥈',
        change: -1
      },
      { 
        rank: 3, 
        user: { id: '3', username: 'TokenMaster', avatar: '🥉', verified: false }, 
        points: 9870, 
        badge: '🥉',
        change: 1
      },
      { 
        rank: 4, 
        user: { id: '4', username: 'DeFiExpert', avatar: '🟦', verified: true }, 
        points: 8540, 
        badge: '🎖️',
        change: 0
      },
      { 
        rank: 5, 
        user: { id: '5', username: 'NFTCollector', avatar: '🟪', verified: false }, 
        points: 7230, 
        badge: '🎖️',
        change: 3
      }
    ];

    return mockData.slice(0, limit);
  }
}

