import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, first, firstValueFrom, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UpdateProfileResponse, UserInfo } from '../models/user.model';

declare const google: any; // For Google Identity Services

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private readonly apiUrl = 'https://localhost:7175/api/Auth';
  private readonly userApiUrl = 'https://localhost:7175/api/User';
  
  private codeClient: any;
  constructor(private http: HttpClient) {
    // Check if user is already logged in
    this.checkAuthStatus();
    this.initGoogleAuth();
    this.initMetaMaskListener();
  }
  
  showAuthModal = signal(false);
  authModalTab = signal<'login' | 'signup'>('login');
  isAuthenticated = signal(false);
  currentUser = signal<{ email: string; name?: string} | null>(null);
  currentWallet: string | null = null;
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  /**
   * Get current user info
   */
  getCurrentUserInfo(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): number | null {
    return this.currentUserSubject.value?.id || null;
  }

  private initGoogleAuth() {
    const init = () => {
      if (typeof google !== 'undefined' && google.accounts?.oauth2) {
        this.codeClient = google.accounts.oauth2.initCodeClient({
          client_id: environment.googleClientId,
          scope: 'openid email profile',
          ux_mode: 'popup',
          redirect_uri: environment.googleRedirectUri,
          callback: (response: any) => this.sendCodeToBackend(response.code)
        });
      } else {
        setTimeout(init, 200);
      }
    };
    init();
  }

  private initMetaMaskListener() {
    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          console.warn('MetaMask disconnected');
          this.logout();
        } else {
          const newWallet = accounts[0];
          if (this.currentWallet && this.currentWallet !== newWallet) {
            console.warn('Wallet changed:', newWallet);
            // Tự động cập nhật hoặc buộc login lại
            this.logout();
            alert('⚠️ You switched MetaMask account. Please reconnect.');
          }
          this.currentWallet = newWallet;
        }
      });
    }
  }
  
  private checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    if (token && userEmail) {
      this.isAuthenticated.set(true);
      this.currentUser.set({
        email: userEmail,
        name: userEmail.split('@')[0] // Use email prefix as display name
      });

      // Load full user info
      this.getUserInfo().subscribe({
        next: (response) => {
          console.log('✅ User info loaded on startup:', response.user);
        },
        error: (err) => {
          console.error('❌ Error loading user info on startup:', err);
        }
      });
    }
  }
  
  openAuthModal(tab: 'login' | 'signup' = 'login'): void {
    this.authModalTab.set(tab);
    this.showAuthModal.set(true);
  }
  
  closeAuthModal(): void {
    this.showAuthModal.set(false);
  }
  
  setUser(email: string, token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    this.isAuthenticated.set(true);
    this.currentUser.set({
      email,
      name: email.split('@')[0]
    });

    // Load full user info after setting token
    this.getUserInfo().subscribe({
      next: (response) => {
        console.log('✅ User info loaded:', response.user);
      },
      error: (err) => {
        console.error('❌ Error loading user info:', err);
      }
    });
  }

  getUserInfo(): Observable<{success: boolean; user: UserInfo}> {
    const token = localStorage.getItem('token');
    console.log('📡 Getting user info with token:', token);
    return this.http.get<{success: boolean; user: UserInfo}>(`https://localhost:7175/api/User/userInfo/${token}`)
      .pipe(
        tap(response => {
          console.log('📦 User info API response:', response);
          if (response.success && response.user) {
            console.log('✅ Setting currentUserSubject with user:', response.user);
            this.currentUserSubject.next(response.user);
          } else {
            console.warn('⚠️ User info response not successful or missing user');
          }
        }), catchError(error => {
          console.error('❌ Error fetching user info:', error);
          throw error;
        })
      );
  }

  updateUserInfo(displayName?: string, bio?: string, birthday?: string, website?: string): Observable<UpdateProfileResponse>{
    const body = {
      displayName: displayName || null,
      bio: bio || null,
      birthday: birthday || null,
      website: website || null
    };
    const token = localStorage.getItem('token') || '';
    return this.http.put<UpdateProfileResponse>(`${this.userApiUrl}/updateProfile`, body, { params: { token: token} });
  }
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
  }
  
  // Login with email and password
  async login(email: string, password: string): Promise<any> {
    const body = { usernameOrEmail: email, password };
    return await firstValueFrom(this.http.post(`${this.apiUrl}/login`, body));
    this.getUserInfo()  ;
  }

  async signup(email: string, password: string): Promise<any> {
    const body = { email, password };
    return await firstValueFrom(this.http.post(`${this.apiUrl}/register`, body));
  }

    // Initiate Google OAuth login
    requestGoogleCode() {
    if (!this.codeClient) {
      console.error('Google code client not initialized yet');
      return;
    }
    this.codeClient.requestCode();
  }

    private sendCodeToBackend(code: string): void {
    this.http.post<any>(`${this.apiUrl}/google`, { code, redirectUri: environment.googleRedirectUri }, { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          console.log('✅ Login success', res);
          const email = res?.user?.email ?? res?.email ?? '';
          const token = res?.token ?? '';
          this.setUser(email, token);
        },
        error: (err) => console.error('Login failed', err)
      });
  }

  // Wallet-based social authentication
  isMetaMaskInstalled(): boolean {
    return typeof (window as any).ethereum !== 'undefined' && (window as any).ethereum.isMetaMask;
  }

  async connectMetaMask(): Promise<string[]> {
    if (!this.isMetaMaskInstalled()){
      throw new Error('MetaMask is not installed');
    }

    try{
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      return accounts;
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      throw error;
    }
  }

  requestNonce(walletAddress: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/wallet/request-nonce`, { walletAddress });
  }

  async signMessage(walletAddress: string, message: string): Promise<string> {
    if (!this.isMetaMaskInstalled()){
      throw new Error('MetaMask is not installed');
    }

    try{
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

  metaMaskLogin(
    walletAddress: string,
    signature: string,
    message: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/wallet/login`, {WalletAddress: walletAddress, Signature: signature, Message: message});
  }

  async getCurrentAccount(): Promise<string | null> {
    if (!this.isMetaMaskInstalled()) {
      return null;
    }

    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_accounts'
      });
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      return null;
    }
  }
  
  socialAuth(provider: string): Promise<any> {
    console.log('Social auth:', provider);
    return Promise.resolve({ success: true });
  } 
}
