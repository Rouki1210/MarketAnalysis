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

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.css']
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
    // TODO: Implement API call to save profile
    this.showSuccess('Profile saved successfully!');
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
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      const userName = currentUser.name || '';
      this.displayName.set(userName);
      this.username.set(userName);
    }
  }

  private getProfileData(): ProfileData {
    return {
      displayName: this.displayName(),
      username: this.username(),
      bio: this.bio(),
      birthday: this.birthday(),
      website: this.website()
    };
  }

  private showSuccess(message: string): void {
    alert(message);
  }
}
