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
  constructor(private authService: AuthService) {
    // Set activeTab based on authService signal
    this.activeTab.set(this.authService.authModalTab());
  }

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

  //Wallet form
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  connectedAccount: string | null = null;
  
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

      if (response && response.token) {
        // Save user info
        this.authService.setUser(this.loginEmail, response.token);
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
  
      if (response && response.token) {
        // Save user info
        this.authService.setUser(this.signupEmail, response.token);
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

  async checkConnectedAccount(): Promise<void> {
    this.connectedAccount = await this.authService.getCurrentAccount();
  }

  async handleMetaMaskLogin(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    try {
      if (!this.authService.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask and try again.');
      }

      const accounts = await this.authService.connectMetaMask();
      const walletAddress = accounts[0];
      this.connectedAccount = walletAddress;

      console.log('Connected wallet address:', walletAddress);

      this.authService.requestNonce(walletAddress).subscribe(
        async (nonceResponse: any) => {
          try {
            const message = nonceResponse.message;
            console.log('Message to sign:', message);

            // Step 4: Sign message with MetaMask
            const signature = await this.authService.signMessage(
              message,
              walletAddress
            );
            console.log('Signature:', signature);

            // Step 5: Send signature to backend for verification
            this.authService
              .metaMaskLogin(walletAddress, signature, message)
              .subscribe(
                (response: any) => {
                  if (response.success) {
                    this.successMessage = 'Login successful!';
                    
                    // Store token
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response.user));
                    this.authService.currentWallet = walletAddress;

                    // Redirect to dashboard
                    setTimeout(() => {
                      this.onClose();
                      this.authService.setUser(response.user.email, response.token);
                    }, 1000);
                  }
                },
                (error: any) => {
                  this.errorMessage =
                    error.error?.error || 'Login failed. Please try again.';
                  this.isLoading = false;
                }
              );
          } catch (error: any) {
            this.errorMessage = error.message || 'Failed to sign message';
            this.isLoading = false;
          }
        },
        (error: any) => {
          this.errorMessage =
            error.error?.error || 'Failed to request nonce';
          this.isLoading = false;
        }
      );
    } catch (error: any) {
      this.errorMessage = error.message || 'An error occurred';
      this.isLoading = false;
    }
  }

  // Authentication via binance
  async handleBinanceLogin(): Promise<void> {
    console.log('Binance login not yet implemented');
  }

  onSocialAuth(provider: string): void {
    console.log('Social auth:', provider);
    // TODO: Implement social authentication
    if (provider === 'google') {
      this.authService.requestGoogleCode();
      this.onClose();
    }
    if (provider === 'wallet') {
      // Implement wallet-based social authentication
      this.handleMetaMaskLogin();
    }
    if (provider === 'binance') {
      this.handleBinanceLogin();
    }
  }
}
