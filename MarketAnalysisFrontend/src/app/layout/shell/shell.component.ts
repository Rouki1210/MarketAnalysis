import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
export class ShellComponent {}

