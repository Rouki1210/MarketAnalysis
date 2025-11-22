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

@Injectable({
    providedIn: 'root',
})
export class AlertService {
    private readonly apiUrl = 'https://localhost:7175'; // backend
    private hubConnection?: signalR.HubConnection;

    // Dòng dữ liệu reactive để component subscribe
    private alertsSubject = new BehaviorSubject<GlobalAlert[]>([]);
    alerts$ = this.alertsSubject.asObservable();

    constructor(private http: HttpClient, private zone: NgZone) { }

    /** 🚀 Kết nối tới SignalR Hub */
    public startConnection(): void {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.apiUrl}/alerthub`)
            .withAutomaticReconnect([0, 2000, 5000, 10000])
            .build();

        this.hubConnection
            .start()
            .then(() => console.log('✅ Connected to GlobalAlert Hub'))
            .catch((err) => console.error('❌ SignalR connection error:', err));

        // Đăng ký listener khi có alert mới
        this.hubConnection.on('ReceiveGlobalAlert', (alert: GlobalAlert) => {
            this.zone.run(() => this.handleIncomingAlert(alert));
        });
    }

    /** 🧩 Xử lý alert nhận được */
    private handleIncomingAlert(alert: GlobalAlert): void {
        const current = this.alertsSubject.value;
        const updated = [alert, ...current].slice(0, 20); // giữ tối đa 20 alert gần nhất
        this.alertsSubject.next(updated);
        console.log(`📢 [ALERT] ${alert.assetSymbol}: ${alert.message}`);
    }

    /** 📬 Lấy danh sách alert gần đây từ API (optional) */
    public getRecentAlerts() {
        return this.http.get<GlobalAlert[]>(`${this.apiUrl}/api/global-alerts/recent`);
    }

    /** 🔌 Ngắt kết nối (khi logout hoặc destroy component) */
    public stopConnection(): void {
        this.hubConnection?.stop().then(() => console.log('🔌 Disconnected from hub'));
    }
}
