import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

/**
 * AuthModalComponent
 *
 * Modal dialog for user authentication (login/signup)
 *
 * Features:
 * - Email/password login and registration
 * - Google OAuth integration
 * - MetaMask wallet-based authentication
 * - Binance wallet authentication (placeholder)
 * - Tab switching between login and signup
 * - Password visibility toggle
 * - Form validation and error handling
 */
@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css'],
})
export class AuthModalComponent {
  // Event emitted when modal should be closed
  @Output() close = new EventEmitter<void>();

  // UI state signals
  activeTab = signal<'login' | 'signup'>('login');
  showPassword = signal(false);

  // Login form fields
  loginEmail = '';
  loginPassword = '';

  // Signup form fields
  signupEmail = '';
  signupPassword = '';
  signupConfirmPassword = '';

  // Wallet authentication state
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  connectedAccount: string | null = null;

  constructor(private authService: AuthService) {
    // Set activeTab based on authService signal
    this.activeTab.set(this.authService.authModalTab());
  }

  // ==================== Tab & UI Controls ====================

  /**
   * Switch between login and signup tabs
   * @param tab Tab to display
   */
  switchTab(tab: 'login' | 'signup'): void {
    this.activeTab.set(tab);
  }

  /**
   * Toggle password visibility for input fields
   */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Close the authentication modal
   * Emits close event to parent component
   */
  onClose(): void {
    this.close.emit();
  }

  // ==================== Email/Password Authentication ====================

  /**
   * Handle email/password login
   * Validates credentials and authenticates user
   */
  async onLogin(): Promise<void> {
    console.log('Login:', this.loginEmail, this.loginPassword);
    try {
      const response = await this.authService.login(
        this.loginEmail,
        this.loginPassword
      );
      console.log('Login response:', response);

      if (response && response.token) {
        // Save user info and close modal
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

  /**
   * Handle email/password registration
   * Creates new user account and logs them in
   */
  async onSignup(): Promise<void> {
    console.log('Signup:', this.signupEmail, this.signupPassword);

    // Validate password confirmation
    if (this.signupPassword !== this.signupConfirmPassword) {
      alert('❌ Passwords do not match.');
      return;
    }

    try {
      const response = await this.authService.signup(
        this.signupEmail,
        this.signupPassword
      );
      console.log('Signup response:', response);

      if (response && response.token) {
        // Save user info and close modal
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

  // ==================== Wallet Authentication ====================

  /**
   * Check currently connected MetaMask account
   */
  async checkConnectedAccount(): Promise<void> {
    this.connectedAccount = await this.authService.getCurrentAccount();
  }

  /**
   * Handle MetaMask wallet login flow
   *
   * Process:
   * 1. Check MetaMask installation
   * 2. Connect wallet
   * 3. Request nonce from backend
   * 4. Sign message with MetaMask
   * 5. Verify signature with backend
   * 6. Create/retrieve user account
   */
  async handleMetaMaskLogin(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    try {
      // Step 1: Verify MetaMask is installed
      if (!this.authService.isMetaMaskInstalled()) {
        throw new Error(
          'MetaMask is not installed. Please install MetaMask and try again.'
        );
      }

      // Step 2: Connect to MetaMask wallet
      const accounts = await this.authService.connectMetaMask();
      const walletAddress = accounts[0];
      this.connectedAccount = walletAddress;

      console.log('Connected wallet address:', walletAddress);

      // Step 3: Request nonce from backend for signature
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

                    // Store authentication tokens
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response.user));
                    this.authService.currentWallet = walletAddress;

                    // Close modal and set user
                    setTimeout(() => {
                      this.onClose();
                      this.authService.setUser(
                        response.user.email,
                        response.token
                      );
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
          this.errorMessage = error.error?.error || 'Failed to request nonce';
          this.isLoading = false;
        }
      );
    } catch (error: any) {
      this.errorMessage = error.message || 'An error occurred';
      this.isLoading = false;
    }
  }

  /**
   * Handle Binance wallet authentication
   * @todo Implement Binance wallet integration
   */
  async handleBinanceLogin(): Promise<void> {
    console.log('Binance login not yet implemented');
  }

  // ==================== Social Authentication ====================

  /**
   * Route social authentication to appropriate handler
   *
   * @param provider Authentication provider ('google', 'wallet', 'binance')
   */
  onSocialAuth(provider: string): void {
    console.log('Social auth:', provider);

    if (provider === 'google') {
      // Google OAuth flow
      this.authService.requestGoogleCode();
      this.onClose();
    } else if (provider === 'wallet') {
      // MetaMask wallet authentication
      this.handleMetaMaskLogin();
    } else if (provider === 'binance') {
      // Binance wallet authentication
      this.handleBinanceLogin();
    }
  }
}
