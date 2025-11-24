// File: src/app/services/alert.service.ts
import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import {
  CreateUserAlertDto,
  UpdateUserAlertDto,
  UserAlertResponseDto,
} from '../models/user-alert.model';

export interface GlobalAlert {
  id?: number;
  assetSymbol: string;
  message: string;
  severity: string;
  triggeredAt: string;
}

export interface UserAlert {
  id: number;
  assetSymbol: string;
  assetName: string;
  message: string;
  targetPrice: number;
  actualPrice: number;
  alertType: string;
  triggeredAt: Date;
}

export interface AutoAlert {
  id: number;
  assetSymbol: string;
  assetName: string;
  targetPrice: number;
  actualPrice: number;
  priceDifference?: number;
  triggeredAt: Date;
  wasViewed: boolean;
  viewedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly apiUrl = 'https://localhost:7175';

  // ✅ FIX: 2 connections riêng biệt
  private globalHubConnection?: signalR.HubConnection;
  private userHubConnection?: signalR.HubConnection;

  // Dòng dữ liệu reactive
  private globalAlertsSubject = new BehaviorSubject<GlobalAlert[]>([]);
  globalAlerts$ = this.globalAlertsSubject.asObservable();

  private userAlertsSubject = new BehaviorSubject<UserAlert[]>([]);
  userAlerts$ = this.userAlertsSubject.asObservable();

  private autoAlertsSubject = new BehaviorSubject<AutoAlert[]>([]);
  autoAlerts$ = this.autoAlertsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  // Token key - chọn 1 và dùng nhất quán
  private readonly TOKEN_KEY = 'token'; // Hoặc 'authToken'

  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private authService: AuthService
  ) {
    // Automatically manage connection based on auth state
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.startUserConnection();
      } else {
        this.stopUserConnection();
      }
    });
  }

  // =========================================
  // GLOBAL ALERTS (Không cần auth)
  // =========================================

  /** Kết nối tới Global Alert Hub */
  public startGlobalConnection(): void {
    if (
      this.globalHubConnection?.state === signalR.HubConnectionState.Connected
    ) {
      console.log('⚠️ Global hub already connected');
      return;
    }

    this.globalHubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}/alerthub`) // Global alerts hub
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.globalHubConnection
      .start()
      .then(() => console.log('✅ Connected to Global Alert Hub'))
      .catch((err) => console.error('❌ Global SignalR error:', err));

    // Listen for global alerts
    this.globalHubConnection.on('ReceiveGlobalAlert', (alert: GlobalAlert) => {
      console.log('🌍 Global alert received:', alert);
      this.zone.run(() => this.handleIncomingGlobalAlert(alert));
    });

    // Reconnection handlers
    this.globalHubConnection.onreconnected(() => {
      console.log('✅ Reconnected to Global Hub');
    });

    this.globalHubConnection.onreconnecting(() => {
      console.log('🔄 Reconnecting to Global Hub...');
    });

    this.globalHubConnection.onclose(() => {
      console.log('❌ Global Hub connection closed');
    });
  }

  private handleIncomingGlobalAlert(alert: GlobalAlert): void {
    const current = this.globalAlertsSubject.value;
    const updated = [alert, ...current].slice(0, 20);
    this.globalAlertsSubject.next(updated);
    console.log(`📢 [GLOBAL] ${alert.assetSymbol}: ${alert.message}`);
  }

  // =========================================
  // USER ALERTS (Cần auth)
  // =========================================

  /** Kết nối tới User Alert Hub */
  public startUserConnection(): void {
    if (
      this.userHubConnection?.state === signalR.HubConnectionState.Connected
    ) {
      console.log('⚠️ User hub already connected');
      return;
    }

    // Check token
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('❌ No auth token! Please login first.');
      return;
    }

    this.userHubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}/useralerthub`, {
        // ✅ FIX: Đúng URL
        accessTokenFactory: () => {
          const currentToken = localStorage.getItem('token');
          if (currentToken) {
            console.log('📤 Sending token to UserAlertHub');
          }
          return currentToken || '';
        },
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.userHubConnection
      .start()
      .then(() => {
        console.log('✅ Connected to User Alert Hub');
        this.loadUnreadCount(); // Load initial count

        // Test ping
        this.userHubConnection
          ?.invoke('Ping')
          .then(() => console.log('📤 Ping sent'))
          .catch((err) => console.error('Ping error:', err));
      })
      .catch((err) => {
        console.error('❌ User SignalR error:', err);

        if (err.toString().includes('401')) {
          console.error('🔐 Unauthorized. Token invalid or expired.');
          this.authService.logout();
          // Optionally redirect to login
        }
      });

    this.userHubConnection.on('ReceiveAlert', (alert: any) => {
      console.log('🔔 User alert received:', alert);
      this.zone.run(() => this.handleIncomingAutoAlert(alert));
    });

    // Listen for UnreadCount
    this.userHubConnection.on('UnreadCount', (count: number) => {
      console.log('📊 Unread count:', count);
      this.zone.run(() => this.unreadCountSubject.next(count));
    });

    // Reconnection handlers
    this.userHubConnection.onreconnected(() => {
      console.log('✅ Reconnected to User Hub');
    });

    this.userHubConnection.onreconnecting(() => {
      console.log('🔄 Reconnecting to User Hub...');
    });

    this.userHubConnection.onclose(() => {
      console.log('❌ User Hub connection closed');
    });
  }

  private handleIncomingAutoAlert(alert: any): void {
    this.zone.run(() => {
      const autoAlert: AutoAlert = {
        id: alert.id,
        assetSymbol: alert.assetSymbol,
        assetName: alert.assetName || alert.assetSymbol,
        targetPrice: alert.targetPrice,
        actualPrice: alert.actualPrice,
        priceDifference: alert.priceDifference || 0,
        triggeredAt: new Date(alert.triggeredAt),
        wasViewed: false,
      };

      const current = this.autoAlertsSubject.value;
      this.autoAlertsSubject.next([autoAlert, ...current]);

      const currentCount = this.unreadCountSubject.value;
      this.unreadCountSubject.next(currentCount + 1);

      this.showBrowserNotification(autoAlert);
    });
  }

  private showBrowserNotification(alert: AutoAlert): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const priceChange = alert.priceDifference
        ? `${
            alert.priceDifference > 0 ? '+' : ''
          }${alert.priceDifference.toFixed(2)}%`
        : '';
      new Notification(`${alert.assetSymbol} Price Alert`, {
        body: `Target: $${alert.targetPrice.toFixed(
          2
        )} | Actual: $${alert.actualPrice.toFixed(2)} ${priceChange}`,
        icon: '/assets/icon.png',
      });
    }
  }

  public getRecentGlobalAlerts() {
    return this.http.get<GlobalAlert[]>(
      `${this.apiUrl}/api/global-alerts/recent`
    );
  }

  public getRecentUserAlerts() {
    return this.http.get<UserAlert[]>(
      `${this.apiUrl}/api/watchlist/auto-alerts/recent`
    );
  }

  // Auto Alerts Methods
  public getAutoAlerts(limit: number = 50) {
    return this.http.get<AutoAlert[]>(
      `${this.apiUrl}/api/watchlist/auto-alerts?limit=${limit}`
    );
  }

  public getUnreadCount() {
    return this.http.get<{ count: number }>(
      `${this.apiUrl}/api/watchlist/auto-alerts/unread-count`
    );
  }

  public markAlertAsViewed(alertId: number) {
    return this.http.post(
      `${this.apiUrl}/api/watchlist/auto-alerts/${alertId}/mark-viewed`,
      {}
    );
  }

  public markAllAlertsAsViewed() {
    return this.http.post(
      `${this.apiUrl}/api/watchlist/auto-alerts/mark-all-viewed`,
      {}
    );
  }

  public loadAutoAlerts(): void {
    this.getAutoAlerts().subscribe({
      next: (alerts) => {
        this.autoAlertsSubject.next(alerts);
      },
      error: (err) => console.error('Failed to load auto alerts:', err),
    });
  }

  public loadUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (response) => {
        this.unreadCountSubject.next(response.count);
      },
      error: (err) => console.error('Failed to load unread count:', err),
    });
  }

  public stopGlobalConnection(): void {
    if (this.globalHubConnection) {
      this.globalHubConnection
        .stop()
        .then(() => console.log('🔌 Disconnected from Global Hub'));
    }
  }

  public stopUserConnection(): void {
    if (this.userHubConnection) {
      this.userHubConnection
        .stop()
        .then(() => console.log('🔌 Disconnected from User Hub'));
    }
  }

  public stopAllConnections(): void {
    this.stopGlobalConnection();
    this.stopUserConnection();
  }

  public requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('Notification permission:', permission);
      });
    }
  }

  public updateLocalAlertStatus(alertId: number, wasViewed: boolean): void {
    const current = this.autoAlertsSubject.value;
    const updated = current.map((a) =>
      a.id === alertId ? { ...a, wasViewed } : a
    );
    this.autoAlertsSubject.next(updated);
  }

  public getConnectionStatus(): { global: string; user: string } {
    return {
      global: this.globalHubConnection?.state || 'Disconnected',
      user: this.userHubConnection?.state || 'Disconnected',
    };
  }

  // =========================================
  // USER CUSTOM ALERTS CRUD
  // =========================================

  public createUserAlert(
    dto: CreateUserAlertDto
  ): Observable<UserAlertResponseDto> {
    return this.http.post<UserAlertResponseDto>(
      `${this.apiUrl}/api/alert`,
      dto
    );
  }

  public getUserAlerts(): Observable<UserAlertResponseDto[]> {
    return this.http.get<UserAlertResponseDto[]>(`${this.apiUrl}/api/alert`);
  }

  public getAlertById(id: number): Observable<UserAlertResponseDto> {
    return this.http.get<UserAlertResponseDto>(
      `${this.apiUrl}/api/alert/${id}`
    );
  }

  public updateUserAlert(
    id: number,
    dto: UpdateUserAlertDto
  ): Observable<UserAlertResponseDto> {
    return this.http.put<UserAlertResponseDto>(
      `${this.apiUrl}/api/alert/${id}`,
      dto
    );
  }

  public deleteUserAlert(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/alert/${id}`);
  }

  public toggleAlertActive(
    id: number,
    isActive: boolean
  ): Observable<UserAlertResponseDto> {
    return this.updateUserAlert(id, { isActive });
  }

  public getAlertHistory(alertId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/alert/${alertId}/history`);
  }

  public getUserHistory(limit: number = 50): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/api/alert/history?limit=${limit}`
    );
  }
}
