import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;

  // biến để lắng nghe dữ liệu realtime
    public priceData: any;


    startConnection() {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('https://localhost:7175/pricehub') // URL backend ASP.NET của bạn
            .withAutomaticReconnect()
            .build();

    this.hubConnection.start()
        .then(() => {
            console.log('✅ SignalR Connected');
            this.joinAsset('BTC');
    })
        .catch(err => console.error('❌ SignalR Error: ', err));

    // Nhận dữ liệu từ backend
    this.hubConnection.on('ReceiveMessage', (message) => {
        console.log('📡 Realtime:', message);
        this.priceData = message.data;
    });
}

    async joinAsset(symbol: string) {
        if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
            await this.hubConnection.invoke('JoinAssetGroup', symbol);
            console.log(`📌 Joined group: ${symbol}`);
    }
}}
