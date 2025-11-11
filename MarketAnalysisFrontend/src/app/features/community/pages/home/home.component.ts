import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-community-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="text-center py-12">
      <h1 class="text-5xl font-bold text-white mb-4">
        Welcome to CMC Community
      </h1>
      <p class="text-xl text-gray-300 mb-8">
        Connect with crypto enthusiasts, share insights, and stay updated
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
        <a routerLink="/community/feed" class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
          <div class="text-4xl mb-3">💬</div>
          <h3 class="text-white font-semibold mb-2">Feed</h3>
          <p class="text-gray-400 text-sm">Latest discussions and posts</p>
        </a>
        
        <a routerLink="/community/topics" class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
          <div class="text-4xl mb-3">🏷️</div>
          <h3 class="text-white font-semibold mb-2">Topics</h3>
          <p class="text-gray-400 text-sm">Browse by category</p>
        </a>
        
        <a routerLink="/community/articles" class="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
          <div class="text-4xl mb-3">📰</div>
          <h3 class="text-white font-semibold mb-2">Articles</h3>
          <p class="text-gray-400 text-sm">Read expert insights</p>
        </a>
      </div>
    </div>
  `,
  styles: []
})
export class CommunityHomeComponent {}

