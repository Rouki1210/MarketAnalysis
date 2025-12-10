import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

/**
 * AppComponent
 *
 * Root component of the Angular application
 *
 * Responsibilities:
 * - Initializes application theme on startup
 * - Provides router outlet for all application views
 * - Minimal template delegates all rendering to child routes
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent implements OnInit {
  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Theme is initialized in the service constructor
    // which loads saved preference and applies CSS classes
  }
}
