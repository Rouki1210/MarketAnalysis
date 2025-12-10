import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * FooterComponent
 *
 * Application footer displayed at bottom of all pages
 * Shows copyright notice with dynamic current year
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  /** Current year for copyright notice */
  currentYear = new Date().getFullYear();
}
