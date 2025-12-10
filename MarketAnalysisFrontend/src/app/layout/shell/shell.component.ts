import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '../header/header.component';
import { TopbarMarketStripComponent } from '../topbar-market-strip/topbar-market-strip.component';
import { FooterComponent } from '../footer/footer.component';

/**
 * ShellComponent
 *
 * Main application shell/layout wrapper
 *
 * Provides consistent structure for all pages:
 * - Header (navigation, user menu, alerts)
 * - Topbar market strip (conditionally shown based on route)
 * - Main content area (router outlet)
 * - Footer
 *
 * Topbar is hidden on /profile and /community routes for cleaner UI
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    TopbarMarketStripComponent,
    FooterComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css'],
})
export class ShellComponent implements OnInit {
  private readonly router = inject(Router);

  /** Routes that should not display the topbar market strip */
  private readonly routesWithoutTopbar = ['/profile', '/community'];

  /** Controls topbar visibility based on current route */
  showTopbarMarketStrip = signal(true);

  ngOnInit(): void {
    this.initializeTopbarVisibility();
    this.subscribeToRouteChanges();
  }

  /** Set initial topbar visibility based on current URL */
  private initializeTopbarVisibility(): void {
    this.updateTopbarVisibility(this.router.url);
  }

  /** Subscribe to navigation events to update topbar visibility */
  private subscribeToRouteChanges(): void {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event) => this.updateTopbarVisibility(event.url));
  }

  /** Update topbar visibility based on current route */
  private updateTopbarVisibility(url: string): void {
    const shouldHideTopbar = this.routesWithoutTopbar.some((route) =>
      url.startsWith(route)
    );
    this.showTopbarMarketStrip.set(!shouldHideTopbar);
  }
}
