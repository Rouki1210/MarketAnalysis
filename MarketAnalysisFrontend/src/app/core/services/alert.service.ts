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

/**
 * Global market alert interface
 * Represents system-wide alerts not tied to specific users
 */
export interface GlobalAlert {
  id?: number;
  assetSymbol: string;
  message: string;
  severity: string;
  triggeredAt: string;
}

/**
 * User-specific alert interface
 * Represents custom alerts created by users
 */
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

/**
 * Automatic watchlist alert interface
 * Represents auto-generated alerts for watchlist items
 */
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

/**
 * AlertService
 *
 * Manages cryptocurrency price alerts and notifications including:
 * - Global market alerts (no authentication required)
 * - User-created custom price alerts (requires authentication)
 * - Automatic watchlist alerts (triggered when watchlist prices hit thresholds)
 * - Real-time alert delivery via SignalR WebSocket connections
 * - Browser notifications for desktop alerts
 * - Alert history and management (create, update, delete, view)
 *
 * The service maintains two separate SignalR connections:
 * - Global Hub: For system-wide market alerts
 * - User Hub: For personalized user alerts (requires authentication)
 */
@Injectable({
  providedIn: 'root',
})
export class AlertService {
  // Backend API base URL
  private readonly apiUrl = 'https://localhost:7175';

  // Separate SignalR hub connections
  private globalHubConnection?: signalR.HubConnection;
  private userHubConnection?: signalR.HubConnection;

  // Observable streams for reactive alert data
  private globalAlertsSubject = new BehaviorSubject<GlobalAlert[]>([]);
  globalAlerts$ = this.globalAlertsSubject.asObservable();

  private userAlertsSubject = new BehaviorSubject<UserAlert[]>([]);
  userAlerts$ = this.userAlertsSubject.asObservable();

  private autoAlertsSubject = new BehaviorSubject<AutoAlert[]>([]);
  autoAlerts$ = this.autoAlertsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  // Authentication token key for localStorage
  private readonly TOKEN_KEY = 'token';

  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private authService: AuthService
  ) {
    // Automatically manage user alert connection based on authentication state
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        // User logged in - connect to user alert hub
        this.startUserConnection();
      } else {
        // User logged out - disconnect from user alert hub
        this.stopUserConnection();
      }
    });
  }

  // ==================== Global Alerts (No Authentication Required) ====================

  /**
   * Connect to Global Alert Hub for system-wide market alerts
   * Global alerts are broadcast to all users regardless of authentication
   */
  public startGlobalConnection(): void {
    // Check if already connected
    if (
      this.globalHubConnection?.state === signalR.HubConnectionState.Connected
    ) {
      console.log('⚠️ Global hub already connected');
      return;
    }

    // Create and configure SignalR connection
    this.globalHubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}/alerthub`) // Global alerts hub endpoint
      .withAutomaticReconnect([0, 2000, 5000, 10000]) // Retry intervals in ms
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Establish connection
    this.globalHubConnection
      .start()
      .then(() => console.log('✅ Connected to Global Alert Hub'))
      .catch((err) => console.error('❌ Global SignalR error:', err));

    // Listen for incoming global alerts
    this.globalHubConnection.on('ReceiveGlobalAlert', (alert: GlobalAlert) => {
      console.log('🌍 Global alert received:', alert);
      this.zone.run(() => this.handleIncomingGlobalAlert(alert));
    });

    // Handle reconnection events
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

  /**
   * Handle incoming global alert from SignalR
   * Updates observable stream and limits to 20 most recent alerts
   * @param alert Incoming global alert
   * @private
   */
  private handleIncomingGlobalAlert(alert: GlobalAlert): void {
    const current = this.globalAlertsSubject.value;
    // Add new alert to beginning and keep only 20 most recent
    const updated = [alert, ...current].slice(0, 20);
    this.globalAlertsSubject.next(updated);
    console.log(`📢 [GLOBAL] ${alert.assetSymbol}: ${alert.message}`);
  }

  // ==================== User Alerts (Authentication Required) ====================

  /**
   * Connect to User Alert Hub for personalized alerts
   * Requires valid authentication token
   * Automatically loads unread count on connection
   */
  public startUserConnection(): void {
    // Check if already connected
    if (
      this.userHubConnection?.state === signalR.HubConnectionState.Connected
    ) {
      console.log('⚠️ User hub already connected');
      return;
    }

    // Verify authentication token exists
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No auth token! Please login first.');
      return;
    }

    // Create and configure SignalR connection with authentication
    this.userHubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrl}/useralerthub`, {
        // Token factory provides fresh token for each connection attempt
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

    // Establish connection
    this.userHubConnection
      .start()
      .then(() => {
        console.log('✅ Connected to User Alert Hub');

        // Load initial unread count
        this.loadUnreadCount();

        // Send test ping to verify connection
        this.userHubConnection
          ?.invoke('Ping')
          .then(() => console.log('📤 Ping sent'))
          .catch((err) => console.error('Ping error:', err));
      })
      .catch((err) => {
        console.error('❌ User SignalR error:', err);

        // Handle authentication errors
        if (err.toString().includes('401')) {
          console.error('🔐 Unauthorized. Token invalid or expired.');
          this.authService.logout();
        }
      });

    // Listen for incoming user alerts
    this.userHubConnection.on('ReceiveAlert', (alert: any) => {
      console.log('🔔 User alert received:', alert);
      this.zone.run(() => this.handleIncomingAutoAlert(alert));
    });

    // Listen for unread count updates
    this.userHubConnection.on('UnreadCount', (count: number) => {
      console.log('📊 Unread count:', count);
      this.zone.run(() => this.unreadCountSubject.next(count));
    });

    // Handle reconnection events
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

  /**
   * Handle incoming automatic alert from SignalR
   * Updates alert list, increments unread count, and shows browser notification
   * @param alert Incoming auto alert data
   * @private
   */
  private handleIncomingAutoAlert(alert: any): void {
    this.zone.run(() => {
      // Transform to AutoAlert format
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

      // Add to beginning of alert list
      const current = this.autoAlertsSubject.value;
      this.autoAlertsSubject.next([autoAlert, ...current]);

      // Increment unread count
      const currentCount = this.unreadCountSubject.value;
      this.unreadCountSubject.next(currentCount + 1);

      // Show browser notification if permission granted
      this.showBrowserNotification(autoAlert);
    });
  }

  /**
   * Display browser notification for alert
   * Requires notification permission to be granted
   * @param alert Alert to display
   * @private
   */
  private showBrowserNotification(alert: AutoAlert): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      // Format price change percentage
      const priceChange = alert.priceDifference
        ? `${
            alert.priceDifference > 0 ? '+' : ''
          }${alert.priceDifference.toFixed(2)}%`
        : '';

      // Create browser notification
      new Notification(`${alert.assetSymbol} Price Alert`, {
        body: `Target: $${alert.targetPrice.toFixed(
          2
        )} | Actual: $${alert.actualPrice.toFixed(2)} ${priceChange}`,
        icon: '/assets/icon.png',
      });
    }
  }

  // ==================== Alert Data Fetching ====================

  /**
   * Fetch recent global alerts from backend
   * @returns Observable with array of recent global alerts
   */
  public getRecentGlobalAlerts(): Observable<GlobalAlert[]> {
    return this.http.get<GlobalAlert[]>(
      `${this.apiUrl}/api/global-alerts/recent`
    );
  }

  /**
   * Fetch recent user alerts from backend
   * @returns Observable with array of recent user alerts
   */
  public getRecentUserAlerts(): Observable<UserAlert[]> {
    return this.http.get<UserAlert[]>(
      `${this.apiUrl}/api/watchlist/auto-alerts/recent`
    );
  }

  /**
   * Fetch automatic watchlist alerts
   * @param limit Maximum number of alerts to fetch
   * @returns Observable with array of auto alerts
   */
  public getAutoAlerts(limit: number = 50): Observable<AutoAlert[]> {
    return this.http.get<AutoAlert[]>(
      `${this.apiUrl}/api/watchlist/auto-alerts?limit=${limit}`
    );
  }

  /**
   * Fetch unread alert count
   * @returns Observable with unread count
   */
  public getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.apiUrl}/api/watchlist/auto-alerts/unread-count`
    );
  }

  /**
   * Mark a specific alert as viewed
   * @param alertId Alert ID to mark
   * @returns Observable for the HTTP request
   */
  public markAlertAsViewed(alertId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/watchlist/auto-alerts/${alertId}/mark-viewed`,
      {}
    );
  }

  /**
   * Mark all alerts as viewed
   * Resets unread count to zero
   * @returns Observable for the HTTP request
   */
  public markAllAlertsAsViewed(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/watchlist/auto-alerts/mark-all-viewed`,
      {}
    );
  }

  /**
   * Load automatic alerts and update observable stream
   */
  public loadAutoAlerts(): void {
    this.getAutoAlerts().subscribe({
      next: (alerts) => {
        this.autoAlertsSubject.next(alerts);
      },
      error: (err) => console.error('Failed to load auto alerts:', err),
    });
  }

  /**
   * Load unread alert count and update observable stream
   */
  public loadUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (response) => {
        this.unreadCountSubject.next(response.count);
      },
      error: (err) => console.error('Failed to load unread count:', err),
    });
  }

  // ==================== Connection Management ====================

  /**
   * Disconnect from Global Alert Hub
   */
  public stopGlobalConnection(): void {
    if (this.globalHubConnection) {
      this.globalHubConnection
        .stop()
        .then(() => console.log('🔌 Disconnected from Global Hub'));
    }
  }

  /**
   * Disconnect from User Alert Hub
   */
  public stopUserConnection(): void {
    if (this.userHubConnection) {
      this.userHubConnection
        .stop()
        .then(() => console.log('🔌 Disconnected from User Hub'));
    }
  }

  /**
   * Disconnect from all alert hubs
   */
  public stopAllConnections(): void {
    this.stopGlobalConnection();
    this.stopUserConnection();
  }

  /**
   * Get current connection status for both hubs
   * @returns Object with connection states
   */
  public getConnectionStatus(): { global: string; user: string } {
    return {
      global: this.globalHubConnection?.state || 'Disconnected',
      user: this.userHubConnection?.state || 'Disconnected',
    };
  }

  // ==================== Browser Notification Permission ====================

  /**
   * Request permission for browser notifications
   * Should be called when user first interacts with alert features
   */
  public requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('Notification permission:', permission);
      });
    }
  }

  // ==================== Local State Management ====================

  /**
   * Update alert viewed status in local observable stream
   * Used for optimistic UI updates
   * @param alertId Alert ID to update
   * @param wasViewed New viewed status
   */
  public updateLocalAlertStatus(alertId: number, wasViewed: boolean): void {
    const current = this.autoAlertsSubject.value;
    const updated = current.map((a) =>
      a.id === alertId ? { ...a, wasViewed } : a
    );
    this.autoAlertsSubject.next(updated);
  }

  // ==================== User Custom Alerts CRUD ====================

  /**
   * Create a new custom price alert
   * @param dto Alert creation data (symbol, target price, alert type, etc.)
   * @returns Observable with created alert response
   */
  public createUserAlert(
    dto: CreateUserAlertDto
  ): Observable<UserAlertResponseDto> {
    return this.http.post<UserAlertResponseDto>(
      `${this.apiUrl}/api/alert`,
      dto
    );
  }

  /**
   * Get all user-created alerts for current user
   * @returns Observable with array of user alerts
   */
  public getUserAlerts(): Observable<UserAlertResponseDto[]> {
    return this.http.get<UserAlertResponseDto[]>(`${this.apiUrl}/api/alert`);
  }

  /**
   * Get specific alert by ID
   * @param id Alert ID
   * @returns Observable with alert details
   */
  public getAlertById(id: number): Observable<UserAlertResponseDto> {
    return this.http.get<UserAlertResponseDto>(
      `${this.apiUrl}/api/alert/${id}`
    );
  }

  /**
   * Update existing alert
   * @param id Alert ID to update
   * @param dto Updated alert data
   * @returns Observable with updated alert response
   */
  public updateUserAlert(
    id: number,
    dto: UpdateUserAlertDto
  ): Observable<UserAlertResponseDto> {
    return this.http.put<UserAlertResponseDto>(
      `${this.apiUrl}/api/alert/${id}`,
      dto
    );
  }

  /**
   * Delete an alert
   * @param id Alert ID to delete
   * @returns Observable for delete request
   */
  public deleteUserAlert(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/alert/${id}`);
  }

  /**
   * Toggle alert active/inactive status
   * @param id Alert ID
   * @param isActive New active status
   * @returns Observable with updated alert
   */
  public toggleAlertActive(
    id: number,
    isActive: boolean
  ): Observable<UserAlertResponseDto> {
    return this.updateUserAlert(id, { isActive });
  }

  /**
   * Get trigger history for a specific alert
   * Shows when alert was triggered in the past
   * @param alertId Alert ID
   * @returns Observable with alert history
   */
  public getAlertHistory(alertId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/alert/${alertId}/history`);
  }

  /**
   * Get all alert trigger history for current user
   * @param limit Maximum number of history entries
   * @returns Observable with user's alert history
   */
  public getUserHistory(limit: number = 50): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/api/alert/history?limit=${limit}`
    );
  }
}
