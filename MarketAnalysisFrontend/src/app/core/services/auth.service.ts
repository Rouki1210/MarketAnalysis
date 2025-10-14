import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private readonly apiUrl = 'https://localhost:7175/api/Auth'; // Placeholder API
  constructor(private http: HttpClient) {}
  showAuthModal = signal(false);
  
  openAuthModal(): void {
    this.showAuthModal.set(true);
  }
  
  closeAuthModal(): void {
    this.showAuthModal.set(false);
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
