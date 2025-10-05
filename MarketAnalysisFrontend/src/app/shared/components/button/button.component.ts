import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'default' | 'ghost' | 'outline' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [class]="buttonClasses"
      [disabled]="disabled"
      [type]="type">
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'default';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth = false;

  get buttonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
    
    const variantClasses: Record<ButtonVariant, string> = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      ghost: 'hover:bg-muted/50 hover:text-foreground',
      outline: 'border border-input bg-transparent hover:bg-muted/50 hover:text-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8',
      icon: 'h-10 w-10'
    };

    const widthClass = this.fullWidth ? 'w-full' : '';

    return `${baseClasses} ${variantClasses[this.variant]} ${sizeClasses[this.size]} ${widthClass}`;
  }
}

