import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type ProfileTab = 'profile' | 'security' | 'notifications';

interface ProfileData {
  displayName: string;
  username: string;
  bio: string;
  birthday: string;
  website: string;
}

import { AlertListComponent } from './components/alert-list/alert-list.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AlertListComponent],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.css'],
})
export class ProfilePage implements OnInit {
  // UI State
  activeTab = signal<ProfileTab>('profile');

  // Form Data
  displayName = signal('');
  username = signal('');
  bio = signal('');
  birthday = signal('');
  website = signal('');

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  // Tab Management
  switchTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
  }

  // Profile Actions
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
        },
        error: () => {
          console.error('Failed to update profile');
        },
      });
  }

  onEditAvatar(): void {
    console.log('Edit avatar clicked');
    // TODO: Implement avatar upload functionality
  }

  onGetAvatarFrame(): void {
    console.log('Get avatar frame clicked');
    // TODO: Implement avatar frame selection
  }

  // Private Methods
  private loadUserData(): void {
    this.authService.getUserInfo().subscribe({
      next: (data) => {
        console.log('User info loaded:', data.user.id);
        if (data?.user) {
          this.displayName.set(data.user.displayName || '');
          this.username.set(data.user.username || '');
          this.bio.set(data.user.bio || '');
          this.birthday.set(data.user.birthday || '');
          this.website.set(data.user.website || '');
        }
      },
      error: (err) => {
        console.error('Failed to load user info:', err);
      },
    });
  }

  private getProfileData(): ProfileData {
    return {
      displayName: this.displayName(),
      username: this.username(),
      bio: this.bio(),
      birthday: this.birthday(),
      website: this.website(),
    };
  }

  private showSuccess(message: string): void {
    alert(message);
  }
}
