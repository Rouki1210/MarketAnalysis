import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UpdateProfileResponse, UserInfo } from '../models/user.model';

// Google Identity Services type declaration
declare const google: any;

/**
 * AuthService
 *
 * Handles all authentication-related functionality including:
 * - Traditional email/password authentication (login/signup)
 * - Google OAuth 2.0 authentication
 * - MetaMask wallet-based authentication
 * - User session management
 * - User profile information
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // API endpoints
  private readonly apiUrl = 'https://localhost:7175/api/Auth';
  private readonly userApiUrl = 'https://localhost:7175/api/User';

  // Google OAuth client for authentication
  private codeClient: any;

  // Authentication state signals (reactive state management)
  showAuthModal = signal(false);
  authModalTab = signal<'login' | 'signup'>('login');
  isAuthenticated = signal(false);
  currentUser = signal<{ email: string; name?: string } | null>(null);

  // Currently connected wallet address (for MetaMask)
  currentWallet: string | null = null;

  // Observable stream of current user information
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize authentication state on service creation
    this.checkAuthStatus();
    this.initGoogleAuth();
    this.initMetaMaskListener();
  }

  /**
   * Get the current user's full information
   * @returns Current user info or null if not authenticated
   */
  getCurrentUserInfo(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get the current user's ID
   * @returns User ID or null if not authenticated
   */
  getCurrentUserId(): number | null {
    return this.currentUserSubject.value?.id || null;
  }

  /**
   * Initialize Google OAuth 2.0 client
   * Retries initialization until Google Identity Services is loaded
   * @private
   */
  private initGoogleAuth(): void {
    const init = () => {
      if (typeof google !== 'undefined' && google.accounts?.oauth2) {
        this.codeClient = google.accounts.oauth2.initCodeClient({
          client_id: environment.googleClientId,
          scope: 'openid email profile',
          ux_mode: 'popup',
          redirect_uri: environment.googleRedirectUri,
          callback: (response: any) => this.sendCodeToBackend(response.code),
        });
      } else {
        // Google library not loaded yet, retry in 200ms
        setTimeout(init, 200);
      }
    };
    init();
  }

  /**
   * Initialize MetaMask account change listener
   * Handles wallet disconnection and account switching
   * @private
   */
  private initMetaMaskListener(): void {
    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          console.warn('MetaMask disconnected');
          this.logout();
        } else {
          // User switched to a different account
          const newWallet = accounts[0];
          if (this.currentWallet && this.currentWallet !== newWallet) {
            console.warn('Wallet changed:', newWallet);
            // Log out user when wallet changes for security
            this.logout();
            alert('⚠️ You switched MetaMask account. Please reconnect.');
          }
          this.currentWallet = newWallet;
        }
      });
    }
  }

  /**
   * Check if user is already authenticated on service initialization
   * Loads user session from localStorage
   * @private
   */
  private checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');

    if (token && userEmail) {
      // User has valid session tokens
      this.isAuthenticated.set(true);
      this.currentUser.set({
        email: userEmail,
        name: userEmail.split('@')[0], // Use email prefix as display name
      });

      // Load full user profile information from backend
      this.getUserInfo().subscribe({
        next: (response) => {
          console.log('✅ User info loaded on startup:', response.user);
        },
        error: (err) => {
          console.error('❌ Error loading user info on startup:', err);
        },
      });
    }
  }

  /**
   * Open the authentication modal
   * @param tab Which tab to display ('login' or 'signup')
   */
  openAuthModal(tab: 'login' | 'signup' = 'login'): void {
    this.authModalTab.set(tab);
    this.showAuthModal.set(true);
  }

  /**
   * Close the authentication modal
   */
  closeAuthModal(): void {
    this.showAuthModal.set(false);
  }

  /**
   * Set the currently authenticated user
   * Stores auth tokens in localStorage and updates reactive state
   * @param email User's email address
   * @param token JWT authentication token
   */
  setUser(email: string, token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    this.isAuthenticated.set(true);
    this.currentUser.set({
      email,
      name: email.split('@')[0],
    });

    // Load full user profile after authentication
    this.getUserInfo().subscribe({
      next: (response) => {
        console.log('✅ User info loaded:', response.user);
      },
      error: (err) => {
        console.error('❌ Error loading user info:', err);
      },
    });
  }

  /**
   * Fetch full user profile information from backend
   * @returns Observable with user info response
   */
  getUserInfo(): Observable<{ success: boolean; user: UserInfo }> {
    const token = localStorage.getItem('token');
    console.log('📡 Getting user info with token:', token);

    return this.http
      .get<{ success: boolean; user: UserInfo }>(
        `${this.userApiUrl}/userInfo/${token}`
      )
      .pipe(
        tap((response) => {
          console.log('📦 User info API response:', response);
          if (response.success && response.user) {
            console.log(
              '✅ Setting currentUserSubject with user:',
              response.user
            );
            this.currentUserSubject.next(response.user);
          } else {
            console.warn(
              '⚠️ User info response not successful or missing user'
            );
          }
        }),
        catchError((error) => {
          console.error('❌ Error fetching user info:', error);
          throw error;
        })
      );
  }

  /**
   * Update user profile information
   * @param displayName User's display name
   * @param bio User's biography
   * @param birthday User's birthday (YYYY-MM-DD format)
   * @param website User's website URL
   * @returns Observable with update response
   */
  updateUserInfo(
    displayName?: string,
    bio?: string,
    birthday?: string,
    website?: string
  ): Observable<UpdateProfileResponse> {
    // Convert birthday string to ISO DateTime format for backend
    let birthdayDate: string | null = null;
    if (birthday) {
      const date = new Date(birthday);
      if (!isNaN(date.getTime())) {
        birthdayDate = date.toISOString();
      }
    }

    // Normalize website URL - ensure it's absolute or null
    let websiteUrl: string | null = null;
    if (website && website.trim()) {
      websiteUrl = website.trim();
      // Add https:// if no protocol specified
      if (
        !websiteUrl.startsWith('http://') &&
        !websiteUrl.startsWith('https://')
      ) {
        websiteUrl = 'https://' + websiteUrl;
      }
    }

    const body = {
      displayName: displayName?.trim() || null,
      bio: bio?.trim() || null,
      birthday: birthdayDate,
      website: websiteUrl,
    };
    const token = localStorage.getItem('token') || '';
    return this.http.put<UpdateProfileResponse>(
      `${this.userApiUrl}/updateProfile`,
      body,
      { params: { token } }
    );
  }

  /**
   * Log out current user
   * Clears all authentication state and tokens
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
  }

  /**
   * Login with email and password
   * @param email User's email address
   * @param password User's password
   * @returns Promise with login response
   */
  async login(email: string, password: string): Promise<any> {
    const body = { usernameOrEmail: email, password };
    const response = await this.http
      .post(`${this.apiUrl}/login`, body)
      .toPromise();

    // Note: getUserInfo() call should be in component after success
    return response;
  }

  /**
   * Register new user with email and password
   * @param email User's email address
   * @param password User's password
   * @returns Promise with signup response
   */
  async signup(email: string, password: string): Promise<any> {
    const body = { email, password };
    return await this.http.post(`${this.apiUrl}/register`, body).toPromise();
  }

  /**
   * Initiate Google OAuth login flow
   * Opens Google sign-in popup
   */
  requestGoogleCode(): void {
    if (!this.codeClient) {
      console.error('Google code client not initialized yet');
      return;
    }
    this.codeClient.requestCode();
  }

  /**
   * Send Google OAuth authorization code to backend
   * Backend exchanges code for user info and creates session
   * @param code Authorization code from Google
   * @private
   */
  private sendCodeToBackend(code: string): void {
    console.log('Sending OAuth code to backend:', code);

    this.http
      .post<any>(`${this.apiUrl}/google`, { code }, { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          console.log('✅ Login success', res);
          const email = res?.user?.email ?? res?.email ?? '';
          const token = res?.token ?? '';
          this.setUser(email, token);
        },
        error: (err) => console.error('Login failed', err),
      });
  }

  // ==================== MetaMask Wallet Authentication ====================

  /**
   * Check if MetaMask browser extension is installed
   * @returns True if MetaMask is available
   */
  isMetaMaskInstalled(): boolean {
    return (
      typeof (window as any).ethereum !== 'undefined' &&
      (window as any).ethereum.isMetaMask
    );
  }

  /**
   * Connect to MetaMask and request account access
   * @returns Promise with array of wallet addresses
   * @throws Error if MetaMask is not installed
   */
  async connectMetaMask(): Promise<string[]> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });
      return accounts;
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      throw error;
    }
  }

  /**
   * Request nonce from backend for wallet authentication
   * Nonce is used to generate a unique message for signing
   * @param walletAddress User's wallet address
   * @returns Observable with nonce response
   */
  requestNonce(walletAddress: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/wallet/request-nonce`, {
      walletAddress,
    });
  }

  /**
   * Sign a message using MetaMask
   * User must approve the signature in MetaMask popup
   * @param walletAddress User's wallet address
   * @param message Message to sign (usually includes nonce)
   * @returns Promise with signature string
   * @throws Error if MetaMask is not installed or user rejects
   */
  async signMessage(walletAddress: string, message: string): Promise<string> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const signature = await (window as any).ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });
      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  /**
   * Authenticate user with wallet signature
   * Backend verifies the signature and creates/retrieves user account
   * @param walletAddress User's wallet address
   * @param signature Signature from MetaMask
   * @param message Original message that was signed
   * @returns Observable with login response
   */
  metaMaskLogin(
    walletAddress: string,
    signature: string,
    message: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/wallet/login`, {
      walletAddress,
      signature,
      message,
    });
  }

  /**
   * Get currently connected MetaMask account without requesting permission
   * @returns Promise with current account address or null
   */
  async getCurrentAccount(): Promise<string | null> {
    if (!this.isMetaMaskInstalled()) {
      return null;
    }

    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_accounts',
      });
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Legacy social auth method (currently unused)
   * @param provider Social provider name
   * @returns Promise with auth response
   * @deprecated Use specific methods like requestGoogleCode() instead
   */
  socialAuth(provider: string): Promise<any> {
    console.log('Social auth:', provider);
    return Promise.resolve({ success: true });
  }
}
