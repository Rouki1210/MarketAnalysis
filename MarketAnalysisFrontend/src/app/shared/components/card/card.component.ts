import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
  @Input() padding = true;
  @Input() customClass = '';

  get cardClasses(): string {
    const baseClasses = 'bg-card border border-border rounded-lg';
    const paddingClass = this.padding ? 'p-6' : '';
    return `${baseClasses} ${paddingClass} ${this.customClass}`;
  }
}

