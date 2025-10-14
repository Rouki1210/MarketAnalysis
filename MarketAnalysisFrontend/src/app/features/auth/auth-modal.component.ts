import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent {
  constructor(private authService: AuthService) {}

  @Output() close = new EventEmitter<void>();
  
  activeTab = signal<'login' | 'signup'>('login');
  showPassword = signal(false);
  
  // Login form
  loginEmail = '';
  loginPassword = '';
  
  // Signup form
  signupEmail = '';
  signupPassword = '';
  signupConfirmPassword = '';
  
  switchTab(tab: 'login' | 'signup'): void {
    this.activeTab.set(tab);
  }
  
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }
  
  onClose(): void {
    this.close.emit();
  }

  async onLogin(): Promise<void> {
    console.log('Login:', this.loginEmail, this.loginPassword);
    try {
      console.log('Login:', this.loginEmail, this.loginPassword);
      const response = await this.authService.login(this.loginEmail, this.loginPassword);
      console.log('Login response:', response);

      if (response.success) {
        this.onClose();
      } else {
        alert('❌ Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('An error occurred while logging in.');
    }
  }

  async onSignup(): Promise<void> {
    console.log('Signup:', this.signupEmail, this.signupPassword);
    if (this.signupPassword !== this.signupConfirmPassword) {
      alert('❌ Passwords do not match.');
      return;
    }
  
    try {
      console.log('Signup:', this.signupEmail, this.signupPassword);
      const response = await this.authService.signup(this.signupEmail, this.signupPassword);
      console.log('Signup response:', response);
  
      if (response.success) {
        alert('✅ Signup successful!');
        this.onClose();
      } else {
        alert('❌ Signup failed.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert('An error occurred during signup.');
    }
  }

  async handleCredentialResponse(response: any) {
    const idToken = response.credential;
    console.log('Google ID Token:', idToken);
    await this.authService.GoogleAuth(idToken);
  }
  
  onSocialAuth(provider: string): void {
    console.log('Social auth:', provider);
    // TODO: Implement social authentication
    
  }
}
