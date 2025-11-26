import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommunitySidebarComponent } from './community-sidebar.component';
import { LeaderboardEntry, LeaderboardService } from '../../services/leaderboard.service';
import { CommunityService } from '../../services/community.service';

@Component({
  selector: 'app-community-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, CommunitySidebarComponent],
  template: `
    <div class="min-h-screen bg-[#0b0e11]">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div class="lg:col-span-1">
            <app-community-sidebar [leaderboard]="leaderboard"></app-community-sidebar>
          </div>
          <main class="lg:col-span-3">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CommunityLayoutComponent implements OnInit, OnDestroy {
  leaderboard: LeaderboardEntry[] = [];

  constructor(private leaderboardService: LeaderboardService, private communityService: CommunityService) {}

  ngOnInit(): void {
    this.leaderboardService.getTopContributors(5).subscribe(
      data => this.leaderboard = data
    );
    this.communityService.startNotificationsRealtime();
  }

  ngOnDestroy(): void {
    this.communityService.stopNotificationsRealtime();
  }
}

