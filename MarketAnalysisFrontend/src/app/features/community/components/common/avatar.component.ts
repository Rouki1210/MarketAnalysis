import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block">
      <div [class]="getAvatarClasses()">
        <span *ngIf="emoji">{{ emoji }}</span>
        <img *ngIf="src && !emoji" [src]="src" [alt]="alt" class="w-full h-full object-cover" />
        <span *ngIf="!src && !emoji" class="text-white font-bold">{{ getInitial() }}</span>
      </div>
      <div *ngIf="verified" class="absolute -bottom-1 -right-1 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center">
        <span class="text-white text-xs">✓</span>
      </div>
    </div>
  `,
  styles: []
})
export class AvatarComponent {
  @Input() src?: string;
  @Input() alt?: string;
  @Input() emoji?: string;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() verified = false;

  getAvatarClasses(): string {
    const sizes = {
      sm: 'w-8 h-8 text-sm',
      md: 'w-12 h-12 text-2xl',
      lg: 'w-16 h-16 text-3xl',
      xl: 'w-24 h-24 text-5xl',
    };

    return `${sizes[this.size]} bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden`;
  }

  getInitial(): string {
    return this.alt?.[0] || '?';
  }
}

