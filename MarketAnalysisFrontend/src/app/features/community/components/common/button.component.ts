import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [disabled]="disabled"
      [class]="getButtonClasses()"
      (click)="onClick.emit($event)">
      <ng-content></ng-content>
    </button>
  `,
  styles: []
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() className = '';
  @Output() onClick = new EventEmitter<Event>();

  getButtonClasses(): string {
    const baseStyles = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50',
      secondary: 'bg-white/10 text-white hover:bg-white/20',
      outline: 'border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white',
      ghost: 'text-gray-300 hover:text-white hover:bg-white/10',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-6 py-2',
      lg: 'px-8 py-3 text-lg',
    };

    return `${baseStyles} ${variants[this.variant]} ${sizes[this.size]} ${this.className}`;
  }
}

