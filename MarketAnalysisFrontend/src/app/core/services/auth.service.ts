import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private readonly apiUrl = 'https://localhost:7175/api/Auth'; // Placeholder API
  constructor(private http: HttpClient) {
    // Check if user is already logged in
    this.checkAuthStatus();
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
  
  // TODO: Implement actual authentication methods
  async login(email: string, password: string): Promise<any> {
    const body = { usernameOrEmail: email, password };
    return await firstValueFrom(this.http.post(`${this.apiUrl}/login`, body));
  }

  async signup(email: string, password: string): Promise<any> {
    const body = { email, password };
    return await firstValueFrom(this.http.post(`${this.apiUrl}/register`, body));
  }

  async GoogleAuth(idToken: string): Promise<any> {
    const response = await firstValueFrom(
      this.http.get(`${this.apiUrl}/google`, { params: { idToken } })
    );
    if (response && (response as any).token) {
      localStorage.setItem('token', (response as any).token);
    }
    return Promise.resolve({ success: true });
  }
  
  socialAuth(provider: string): Promise<any> {
    console.log('Social auth:', provider);
    return Promise.resolve({ success: true });
  }
}
