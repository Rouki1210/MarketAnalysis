import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  authProvider: string;
  createdAt: string;
}

interface Asset {
  id: number;
  symbol: string;
  name: string;
  rank: string;
  logoUrl: string;
}

interface PricePoint {
  symbol: string;
  name: string;
  price: number;
  percentChange24h: number;
  marketCap: number;
  volume: number;
  timestampUtc: string;
}

interface GlobalMetric {
  total_market_cap_usd: number;
  total_market_cap_percent_change_24h: number;
  total_volume_24h: number;
  bitcoin_dominance_price: number;
  fear_and_greed_text: string;
  fear_and_greed_index: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private apiUrl = 'http://localhost:5071/api';
  
  sidebarOpen = true;
  activeTab = 'overview';
  darkMode = false;
  
  users: User[] = [];
  assets: Asset[] = [];
  prices: PricePoint[] = [];
  globalMetric: GlobalMetric | null = null;
  
  totalUsers = 0;
  totalAssets = 0;
  totalVolume24h = 0;
  marketCapChange = 0;
  
  loading = {
    users: false,
    assets: false,
    prices: false,
    metrics: false
  };

  navigationItems = [
    { name: 'Overview', icon: '📈', id: 'overview', active: true },
    { name: 'Users', icon: '👤', id: 'users', active: false },
    { name: 'Assets', icon: '💰', id: 'assets', active: false },
    { name: 'Prices', icon: '📊', id: 'prices', active: false },
    { name: 'Settings', icon: '⚙️', id: 'settings', active: false }
  ];

  constructor(private http: HttpClient) {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      this.darkMode = savedDarkMode === 'true';
    } else {
      // Detect system preference
      this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyDarkMode();
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    await Promise.all([
      this.loadUsers(),
      this.loadAssets(),
      this.loadPrices(),
      this.loadGlobalMetrics()
    ]);
    this.calculateStatistics();
  }

  async loadUsers() {
    this.loading.users = true;
    try {
      const response = await this.http.get<User[]>(`${this.apiUrl}/User/users`).toPromise();
      this.users = response || [];
      this.totalUsers = this.users.length;
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      this.loading.users = false;
    }
  }

  async loadAssets() {
    this.loading.assets = true;
    try {
      const response = await this.http.get<Asset[]>(`${this.apiUrl}/Asset`).toPromise();
      this.assets = response || [];
      this.totalAssets = this.assets.length;
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      this.loading.assets = false;
    }
  }

  async loadPrices() {
    this.loading.prices = true;
    try {
      const response = await this.http.get<PricePoint[]>(`${this.apiUrl}/Prices`).toPromise();
      this.prices = (response || []).slice(0, 20);
    } catch (error) {
      console.error('Error loading prices:', error);
    } finally {
      this.loading.prices = false;
    }
  }

  async loadGlobalMetrics() {
    this.loading.metrics = true;
    try {
      const response = await this.http.get<GlobalMetric[]>(`${this.apiUrl.replace('/api', '')}/GlobalMetric/global-metric`).toPromise();
      if (response && response.length > 0) {
        this.globalMetric = response[response.length - 1];
      }
    } catch (error) {
      console.error('Error loading global metrics:', error);
    } finally {
      this.loading.metrics = false;
    }
  }

  calculateStatistics() {
    if (this.globalMetric) {
      this.totalVolume24h = this.globalMetric.total_volume_24h;
      this.marketCapChange = this.globalMetric.total_market_cap_percent_change_24h;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
    this.navigationItems.forEach(item => {
      item.active = item.id === tabId;
    });
  }

  async refreshAssets() {
    try {
      await this.http.post(`${this.apiUrl}/Asset/refreshTop`, {}).toPromise();
      await this.loadAssets();
      alert('Assets refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing assets:', error);
    }
  }

  formatNumber(num: number): string {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getChangeClass(change: number): string {
    return change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  }

  getAuthProviderColor(provider: string): string {
    const colors: { [key: string]: string } = {
      'Local': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Google': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'MetaMask': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    };
    return colors[provider] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode.toString());
    this.applyDarkMode();
  }

  private applyDarkMode(): void {
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}