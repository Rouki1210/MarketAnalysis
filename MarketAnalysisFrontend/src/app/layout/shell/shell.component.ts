import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '../header/header.component';
import { TopbarMarketStripComponent } from '../topbar-market-strip/topbar-market-strip.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    TopbarMarketStripComponent,
    FooterComponent
  ],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class ShellComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly routesWithoutTopbar = ['/profile', '/community'];

  showTopbarMarketStrip = signal(true);

  ngOnInit(): void {
    this.initializeTopbarVisibility();
    this.subscribeToRouteChanges();
  }

  private initializeTopbarVisibility(): void {
    this.updateTopbarVisibility(this.router.url);
  }

  private subscribeToRouteChanges(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.updateTopbarVisibility(event.url));
  }

  private updateTopbarVisibility(url: string): void {
    const shouldHideTopbar = this.routesWithoutTopbar.some(route => url.startsWith(route));
    this.showTopbarMarketStrip.set(!shouldHideTopbar);
  }
}
