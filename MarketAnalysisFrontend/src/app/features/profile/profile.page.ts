import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/** Available profile page tabs */
type ProfileTab = 'profile' | 'security' | 'notifications';

/** User profile data structure */
interface ProfileData {
  displayName: string;
  username: string;
  bio: string;
  birthday: string;
  website: string;
}

import { AlertListComponent } from './components/alert-list/alert-list.component';

/**
 * ProfilePage
 *
 * User profile and settings management page
 *
 * Features:
 * - Profile information editing (name, bio, birthday, website)
 * - Avatar management (TODO: upload functionality)
 * - Security settings tab
 * - Notifications/alerts management tab
 * - Real-time form updates with Angular signals
 *
 * Tabs:
 * - Profile: Edit user information and avatar
 * - Security: Password and account security (TODO)
 * - Notifications: Manage price alerts (via AlertListComponent)
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AlertListComponent],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.css'],
})
export class ProfilePage implements OnInit {
  /** Currently active tab */
  activeTab = signal<ProfileTab>('profile');

  // Form fields using signals for reactivity
  displayName = signal('');
  username = signal('');
  bio = signal('');
  birthday = signal('');
  website = signal('');

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  /**
   * Switch between profile tabs
   * @param tab Tab to display
   */
  switchTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
  }

  /**
   * Save profile changes to backend
   * Updates user information via AuthService
   */
  onSave(): void {
    const profileData = this.getProfileData();
    console.log('Saving profile:', profileData);

    this.authService
      .updateUserInfo(
        profileData.displayName,
        profileData.bio,
        profileData.birthday,
        profileData.website
      )
      .subscribe({
        next: () => {
          this.showSuccess('Profile updated successfully!');
          // Reload user data to sync with backend
          this.loadUserData();
        },
        error: (err) => {
          console.error('Failed to update profile:', err);
          // Extract error message from backend response
          const errorMessage =
            err?.error?.message ||
            err?.message ||
            'Failed to update profile. Please try again.';
          this.showError(errorMessage);
        },
      });
  }

  /**
   * Handle avatar edit action
   * @todo Implement avatar upload functionality
   */
  onEditAvatar(): void {
    console.log('Edit avatar clicked');
    // TODO: Implement avatar upload functionality
  }

  /**
   * Handle avatar frame selection
   * @todo Implement avatar frame selection
   */
  onGetAvatarFrame(): void {
    console.log('Get avatar frame clicked');
    // TODO: Implement avatar frame selection
  }

  /**
   * Load user data from backend
   * Populates form fields with current user information
   * @private
   */
  private loadUserData(): void {
    this.authService.getUserInfo().subscribe({
      next: (data) => {
        console.log('User info loaded:', data.user.id);
        if (data?.user) {
          this.displayName.set(data.user.displayName || '');
          this.username.set(data.user.username || '');
          this.bio.set(data.user.bio || '');
          // Convert ISO DateTime to YYYY-MM-DD for HTML date input
          this.birthday.set(this.formatDateForInput(data.user.birthday));
          this.website.set(data.user.website || '');
        }
      },
      error: (err) => {
        console.error('Failed to load user info:', err);
      },
    });
  }

  /**
   * Get current form data as ProfileData object
   * @private
   */
  private getProfileData(): ProfileData {
    return {
      displayName: this.displayName(),
      username: this.username(),
      bio: this.bio(),
      birthday: this.birthday(),
      website: this.website(),
    };
  }

  /**
   * Show success message to user
   * @private
   */
  private showSuccess(message: string): void {
    alert(message);
  }

  /**
   * Show error message to user
   * @private
   */
  private showError(message: string): void {
    alert(message);
  }

  /**
   * Format date string from backend to YYYY-MM-DD for HTML date input
   * @param dateString ISO DateTime string from backend (e.g., "2000-01-15T00:00:00Z")
   * @returns Date in YYYY-MM-DD format or empty string if invalid
   * @private
   */
  private formatDateForInput(dateString?: string | null): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      // Format as YYYY-MM-DD for HTML date input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  }
}
