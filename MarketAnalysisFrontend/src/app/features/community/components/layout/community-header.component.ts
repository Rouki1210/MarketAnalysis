import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../common/search-bar.component';
import { ButtonComponent } from '../common/button.component';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-community-header',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    SearchBarComponent, 
    ButtonComponent
  ],
  template: `
    <header class="bg-black/30 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <a routerLink="/community" class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span class="text-white text-xl">📈</span>
            </div>
            <h1 class="text-2xl font-bold text-white">CMC Community</h1>
          </a>

          <div class="flex items-center gap-4">
            <app-search-bar
              [value]="searchQuery"
              (valueChange)="onSearchChange($event)"
              placeholder="Search discussions..."
              className="w-64">
            </app-search-bar>

            <app-button (onClick)="onCreatePost()">Create Post</app-button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class CommunityHeaderComponent implements OnInit {
  searchQuery = '';

  constructor(
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // No authentication needed
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
  }

  onCreatePost(): void {
    // Navigate to feed page if not already there
    if (!this.router.url.includes('/community/feed')) {
      this.router.navigate(['/community/feed']).then(() => {
        // Small delay to ensure component is initialized
        setTimeout(() => {
          this.modalService.openCreatePost();
        }, 100);
      });
    } else {
      this.modalService.openCreatePost();
    }
  }
}

