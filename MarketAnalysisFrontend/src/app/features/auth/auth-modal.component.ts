import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent {
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
  
  onLogin(): void {
    console.log('Login:', this.loginEmail, this.loginPassword);
    // TODO: Implement login logic
  }
  
  onSignup(): void {
    console.log('Signup:', this.signupEmail, this.signupPassword);
    // TODO: Implement signup logic
  }
  
  onSocialAuth(provider: string): void {
    console.log('Social auth:', provider);
    // TODO: Implement social authentication
  }
}
