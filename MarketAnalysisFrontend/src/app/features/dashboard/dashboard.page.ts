import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CryptoTableComponent } from './components/crypto-table/crypto-table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CryptoTableComponent],
  template: `
    <div class="min-h-screen">
      <app-crypto-table></app-crypto-table>
    </div>
  `
})
export class DashboardPage {}

