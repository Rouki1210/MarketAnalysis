import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  user: string;
  avatar: string;
  message: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-white mb-2">🔔 Notifications</h1>
        <p class="text-gray-400">Stay updated with your activity</p>
      </div>

      <div class="space-y-3">
        <div 
          *ngFor="let notification of notifications()"
          [class]="getNotificationClasses(notification)"
          (click)="markAsRead(notification.id)">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl flex-shrink-0">
              {{ notification.avatar }}
            </div>
            
            <div class="flex-1 min-w-0">
              <p class="text-white">
                <span class="font-semibold">{{ notification.user }}</span>
                {{ notification.message }}
              </p>
              <p class="text-gray-400 text-sm mt-1">{{ notification.time }}</p>
            </div>
            
            <div class="flex-shrink-0">
              <span *ngIf="!notification.read" class="w-2 h-2 bg-blue-500 rounded-full block"></span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="notifications().length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🔕</div>
        <h3 class="text-xl font-semibold text-white mb-2">No notifications</h3>
        <p class="text-gray-400">You're all caught up!</p>
      </div>
    </div>
  `,
  styles: []
})
export class NotificationsComponent {
  notifications = signal<Notification[]>([
    {
      id: '1',
      type: 'like',
      user: 'CryptoGuru',
      avatar: '🏆',
      message: 'liked your post about Bitcoin',
      time: '5 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'comment',
      user: 'BlockchainPro',
      avatar: '🥈',
      message: 'commented on your post',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      type: 'follow',
      user: 'TokenMaster',
      avatar: '🥉',
      message: 'started following you',
      time: '3 hours ago',
      read: true
    },
    {
      id: '4',
      type: 'mention',
      user: 'DeFiExpert',
      avatar: '🟦',
      message: 'mentioned you in a comment',
      time: '1 day ago',
      read: true
    }
  ]);

  getNotificationClasses(notification: Notification): string {
    const baseClasses = 'bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 cursor-pointer transition-colors';
    const unreadClasses = notification.read ? '' : 'bg-purple-500/10 border-purple-500/30';
    const hoverClasses = 'hover:border-purple-500/50';
    
    return `${baseClasses} ${unreadClasses} ${hoverClasses}`;
  }

  markAsRead(id: string): void {
    const currentNotifications = this.notifications();
    const updatedNotifications = currentNotifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notifications.set(updatedNotifications);
  }
}

