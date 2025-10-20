import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first, firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

declare const google: any; // For Google Identity Services

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private readonly apiUrl = 'https://localhost:7175/api/Auth';
  
  private codeClient: any;
  constructor(private http: HttpClient) {
    // Check if user is already logged in
    this.checkAuthStatus();
    const init = () => {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
        this.codeClient = google.accounts.oauth2.initCodeClient({
          client_id: environment.googleClientId,
          scope: 'openid email profile',
          ux_mode: 'popup',
          redirect_uri: environment.googleRedirectUri,
          callback: (response: any) => {
            console.log('Google code:', response.code);
            this.sendCodeToBackend(response.code);
          }
        });
      } else {
        setTimeout(init, 200);
      }
    };
    init();
  }
  
  showAuthModal = signal(false);
  authModalTab = signal<'login' | 'signup'>('login');
  isAuthenticated = signal(false);
  currentUser = signal<{ email: string; name?: string } | null>(null);
  
  private checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    if (token && userEmail) {
      this.isAuthenticated.set(true);
      this.currentUser.set({ 
        email: userEmail,
        name: userEmail.split('@')[0] // Use email prefix as display name
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
  }
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }
  
  // Login with email and password
  async login(email: string, password: string): Promise<any> {
    const body = { usernameOrEmail: email, password };
    return await firstValueFrom(this.http.post(`${this.apiUrl}/login`, body));
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
    // POST to backend to exchange the code and create session
    console.log('Sending OAuth code to backend:', code);
    this.http.post<any>(`${this.apiUrl}/google`, { code }, { withCredentials: true })
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
    return this.http.post(`${this.apiUrl}/wallet/login`, {
      walletAddress,
      signature,
      message
    });
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
