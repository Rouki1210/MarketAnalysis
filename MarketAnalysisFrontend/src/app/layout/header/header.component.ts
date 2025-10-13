import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AuthModalComponent } from '../../features/auth/auth-modal.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonComponent, AuthModalComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  searchQuery = '';

  constructor(public authService: AuthService) {}

  onSearch(): void {
    console.log('Search:', this.searchQuery);
  }

  openAuthModal(): void {
    this.authService.openAuthModal();
  }
}

