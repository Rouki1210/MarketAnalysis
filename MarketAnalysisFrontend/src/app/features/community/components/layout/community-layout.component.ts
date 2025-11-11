import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommunityHeaderComponent } from './community-header.component';
import { CommunitySidebarComponent } from './community-sidebar.component';
import { LeaderboardEntry, LeaderboardService } from '../../services/leaderboard.service';

@Component({
  selector: 'app-community-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, CommunityHeaderComponent, CommunitySidebarComponent],
  template: `
    <div class="min-h-screen bg-[#0b0e11]">
      <app-community-header></app-community-header>
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
export class CommunityLayoutComponent implements OnInit {
  leaderboard: LeaderboardEntry[] = [];

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    this.leaderboardService.getTopContributors(5).subscribe(
      data => this.leaderboard = data
    );
  }
}

