import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardService, LeaderboardEntry } from '../../services/leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-white mb-2">🏆 Leaderboard</h1>
        <p class="text-gray-400">Top contributors in the community</p>
      </div>

      <div class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-white/5 border-b border-purple-500/20">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rank</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">User</th>
                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-300">Points</th>
                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-300">Change</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-purple-500/10">
              <tr 
                *ngFor="let entry of leaderboard()"
                class="hover:bg-white/5 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">{{ entry.badge }}</span>
                    <span class="text-white font-semibold">#{{ entry.rank }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                      {{ entry.user.avatar || '👤' }}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-white font-medium">{{ entry.user.username }}</span>
                        <span *ngIf="entry.user.verified" class="text-blue-400 text-sm">✓</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <span class="text-white font-semibold">{{ entry.points.toLocaleString() }}</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <span 
                    *ngIf="entry.change !== undefined"
                    [class]="getChangeClasses(entry.change)">
                    {{ entry.change > 0 ? '+' : '' }}{{ entry.change }}
                  </span>
                  <span *ngIf="entry.change === undefined || entry.change === 0" class="text-gray-400">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="leaderboard().length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🏆</div>
        <h3 class="text-xl font-semibold text-white mb-2">No data available</h3>
        <p class="text-gray-400">Leaderboard is empty</p>
      </div>
    </div>
  `,
  styles: []
})
export class LeaderboardComponent implements OnInit {
  leaderboard = signal<LeaderboardEntry[]>([]);

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    this.leaderboardService.getLeaderboard(50).subscribe(
      data => this.leaderboard.set(data)
    );
  }

  getChangeClasses(change: number): string {
    if (change > 0) return 'text-green-400 font-medium';
    if (change < 0) return 'text-red-400 font-medium';
    return 'text-gray-400';
  }
}

