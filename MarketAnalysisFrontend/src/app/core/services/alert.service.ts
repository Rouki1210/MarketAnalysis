// File: src/app/services/alert.service.ts
import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

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

    // Token key - chọn 1 và dùng nhất quán
    private readonly TOKEN_KEY = 'token';  // Hoặc 'authToken'

    constructor(private http: HttpClient, private zone: NgZone) { }

    // =========================================
    // GLOBAL ALERTS (Không cần auth)
    // =========================================
    
    /** Kết nối tới Global Alert Hub */
    public startGlobalConnection(): void {
        if (this.globalHubConnection?.state === signalR.HubConnectionState.Connected) {
            console.log('⚠️ Global hub already connected');
            return;
        }

        this.globalHubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.apiUrl}/alerthub`)  // Global alerts hub
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
        if (this.userHubConnection?.state === signalR.HubConnectionState.Connected) {
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
            .withUrl(`${this.apiUrl}/useralerthub`, {  // ✅ FIX: Đúng URL
                accessTokenFactory: () => {
                    const currentToken = localStorage.getItem('token');
                    if (currentToken) {
                        console.log('📤 Sending token to UserAlertHub');
                    }
                    return currentToken || '';
                }
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000])
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.userHubConnection
            .start()
            .then(() => {
                console.log('✅ Connected to User Alert Hub');
                
                // Test ping
                this.userHubConnection?.invoke('Ping')
                    .then(() => console.log('📤 Ping sent'))
                    .catch(err => console.error('Ping error:', err));
            })
            .catch((err) => {
                console.error('❌ User SignalR error:', err);
                
                if (err.toString().includes('401')) {
                    console.error('🔐 Unauthorized. Token invalid or expired.');
                    // Optionally redirect to login
                }
            });

        this.userHubConnection.on('ReceiveAlert', (alert: UserAlert) => {
            console.log('🔔 User alert received:', alert);
            this.zone.run(() => this.handleIncomingUserAlert(alert));
        });

        // Listen for UnreadCount
        this.userHubConnection.on('UnreadCount', (count: number) => {
            console.log('📊 Unread count:', count);
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

    private handleIncomingUserAlert(alert: UserAlert): void {
        const current = this.userAlertsSubject.value;
        const updated = [alert, ...current].slice(0, 20);
        this.userAlertsSubject.next(updated);
        console.log(`📢 [USER] ${alert.assetSymbol}: ${alert.message}`);

        this.showBrowserNotification(alert);
    }

    private showBrowserNotification(alert: UserAlert): void {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${alert.assetSymbol} Alert`, {
                body: alert.message,
                icon: '/assets/icon.png'  // Your app icon
            });
        }
    }

    
    public getRecentGlobalAlerts() {
        return this.http.get<GlobalAlert[]>(`${this.apiUrl}/api/global-alerts/recent`);
    }

    public getRecentUserAlerts() {
        return this.http.get<UserAlert[]>(`${this.apiUrl}/api/watchlist/auto-alerts/recent`);
    }
    
    public stopGlobalConnection(): void {
        if (this.globalHubConnection) {
            this.globalHubConnection.stop()
                .then(() => console.log('🔌 Disconnected from Global Hub'));
        }
    }

    public stopUserConnection(): void {
        if (this.userHubConnection) {
            this.userHubConnection.stop()
                .then(() => console.log('🔌 Disconnected from User Hub'));
        }
    }

    public stopAllConnections(): void {
        this.stopGlobalConnection();
        this.stopUserConnection();
    }

    
    public requestNotificationPermission(): void {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('Notification permission:', permission);
            });
        }
    }

    public getConnectionStatus(): { global: string; user: string } {
        return {
            global: this.globalHubConnection?.state || 'Disconnected',
            user: this.userHubConnection?.state || 'Disconnected'
        };
    }
}