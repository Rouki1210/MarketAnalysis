# 📁 Complete File Structure

```
Frontend/
│
├── 📄 package.json                          # Dependencies and scripts
├── 📄 angular.json                          # Angular CLI configuration
├── 📄 tsconfig.json                         # TypeScript configuration
├── 📄 tsconfig.app.json                     # App-specific TypeScript config
├── 📄 tailwind.config.js                    # TailwindCSS configuration
├── 📄 postcss.config.js                     # PostCSS configuration
├── 📄 .gitignore                            # Git ignore rules
├── 📄 .editorconfig                         # Editor configuration
│
├── 📄 README.md                             # Project overview
├── 📄 SETUP.md                              # Setup instructions
├── 📄 MIGRATION_GUIDE.md                    # React to Angular guide
├── 📄 PROJECT_SUMMARY.md                    # Project summary
├── 📄 FILE_STRUCTURE.md                     # This file
├── 📄 install.sh                            # Installation script
│
├── 📂 src/
│   ├── 📄 index.html                        # Main HTML file
│   ├── 📄 main.ts                           # Application entry point
│   ├── 📄 favicon.ico                       # Favicon
│   │
│   ├── 📂 styles/
│   │   └── 📄 global.scss                   # Global styles + TailwindCSS
│   │
│   ├── 📂 assets/
│   │   └── 📄 .gitkeep                      # Placeholder for assets
│   │
│   └── 📂 app/
│       ├── 📄 app.component.ts              # Root component
│       ├── 📄 app.config.ts                 # App configuration
│       ├── 📄 app.routes.ts                 # Route definitions
│       │
│       ├── 📂 core/                         # 🎯 SINGLETON SERVICES & MODELS
│       │   │
│       │   ├── 📂 services/
│       │   │   ├── 📄 api.service.ts        # API calls & data fetching
│       │   │   ├── 📄 theme.service.ts      # Dark/light theme management
│       │   │   ├── 📄 currency.service.ts   # Currency conversion (USD/VND/BTC/ETH)
│       │   │   └── 📄 realtime.service.ts   # Real-time price updates
│       │   │
│       │   ├── 📂 models/
│       │   │   ├── 📄 coin.model.ts         # Coin, CoinDetail, CoinStats
│       │   │   ├── 📄 market.model.ts       # Market, MarketStats
│       │   │   └── 📄 common.model.ts       # Currency, TimeFrame, ChartData
│       │   │
│       │   ├── 📂 interceptors/             # HTTP interceptors (ready)
│       │   └── 📂 guards/                   # Route guards (ready)
│       │
│       ├── 📂 shared/                       # 🔧 REUSABLE COMPONENTS & UTILITIES
│       │   │
│       │   ├── 📂 components/
│       │   │   ├── 📂 button/
│       │   │   │   └── 📄 button.component.ts
│       │   │   ├── 📂 card/
│       │   │   │   └── 📄 card.component.ts
│       │   │   ├── 📂 badge/
│       │   │   │   └── 📄 badge.component.ts
│       │   │   ├── 📂 skeleton/
│       │   │   │   └── 📄 skeleton.component.ts
│       │   │   └── 📂 sparkline/
│       │   │       └── 📄 sparkline.component.ts
│       │   │
│       │   └── 📂 pipes/
│       │       ├── 📄 format-currency.pipe.ts   # $1.5T, $234M
│       │       ├── 📄 format-number.pipe.ts     # Locale formatting
│       │       ├── 📄 percent-color.pipe.ts     # Color based on +/-
│       │       └── 📄 time-ago.pipe.ts          # "2 hours ago"
│       │
│       ├── 📂 layout/                       # 🏗️ APP SHELL & LAYOUT
│       │   │
│       │   ├── 📂 shell/
│       │   │   ├── 📄 shell.component.ts
│       │   │   ├── 📄 shell.component.html
│       │   │   └── 📄 shell.component.scss
│       │   │
│       │   ├── 📂 header/
│       │   │   ├── 📄 header.component.ts       # Logo, nav, search, auth
│       │   │   ├── 📄 header.component.html
│       │   │   └── 📄 header.component.scss
│       │   │
│       │   ├── 📂 topbar-market-strip/
│       │   │   ├── 📄 topbar-market-strip.component.ts
│       │   │   ├── 📄 topbar-market-strip.component.html
│       │   │   └── 📄 topbar-market-strip.component.scss
│       │   │
│       │   └── 📂 footer/
│       │       ├── 📄 footer.component.ts
│       │       ├── 📄 footer.component.html
│       │       └── 📄 footer.component.scss
│       │
│       └── 📂 features/                     # 🎨 FEATURE MODULES (Lazy Loaded)
│           │
│           ├── 📂 dashboard/                # Main cryptocurrency table page
│           │   ├── 📄 dashboard.page.ts
│           │   ├── 📄 dashboard.routes.ts
│           │   │
│           │   └── 📂 components/
│           │       └── 📂 crypto-table/
│           │           ├── 📄 crypto-table.component.ts
│           │           ├── 📄 crypto-table.component.html
│           │           └── 📄 crypto-table.component.scss
│           │
│           └── 📂 coin/                     # Coin detail page
│               ├── 📄 coin.page.ts
│               ├── 📄 coin.page.html
│               ├── 📄 coin.page.scss
│               ├── 📄 coin.routes.ts
│               │
│               └── 📂 components/
│                   ├── 📂 coin-stats/
│                   │   ├── 📄 coin-stats.component.ts
│                   │   ├── 📄 coin-stats.component.html
│                   │   └── 📄 coin-stats.component.scss
│                   │
│                   ├── 📂 price-chart/
│                   │   ├── 📄 price-chart.component.ts
│                   │   ├── 📄 price-chart.component.html
│                   │   └── 📄 price-chart.component.scss
│                   │
│                   └── 📂 market-pairs-table/
│                       ├── 📄 market-pairs-table.component.ts
│                       ├── 📄 market-pairs-table.component.html
│                       └── 📄 market-pairs-table.component.scss
│
└── (node_modules will be created after npm install)
```

## 📊 File Statistics

### By Type
- TypeScript (`.ts`): 32 files
- HTML (`.html`): 8 files
- SCSS (`.scss`): 8 files
- Configuration: 8 files
- Documentation: 5 files
- **Total: 61 files**

### By Category

#### Core (9 files)
- Services: 4
- Models: 3
- Folders: 2 (interceptors, guards)

#### Shared (9 files)
- Components: 5
- Pipes: 4

#### Layout (12 files)
- Components: 4 (Shell, Header, Topbar, Footer)
- Each with .ts, .html, .scss

#### Features (20+ files)
- Dashboard: 4 files
- Coin Detail: 13 files
- Routes: 2 files

#### Configuration (8 files)
- package.json
- angular.json
- tsconfig.json + tsconfig.app.json
- tailwind.config.js
- postcss.config.js
- .gitignore
- .editorconfig

#### Documentation (6 files)
- README.md
- SETUP.md
- MIGRATION_GUIDE.md
- PROJECT_SUMMARY.md
- FILE_STRUCTURE.md
- install.sh

## 🎯 Component Hierarchy

```
AppComponent
└── ShellComponent
    ├── HeaderComponent
    ├── TopbarMarketStripComponent
    ├── <router-outlet>
    │   ├── DashboardPage
    │   │   └── CryptoTableComponent
    │   │       ├── ButtonComponent (x12)
    │   │       ├── CardComponent
    │   │       └── SparklineComponent (x10)
    │   │
    │   └── CoinPage
    │       ├── ButtonComponent (x7)
    │       ├── CoinStatsComponent
    │       │   ├── CardComponent (x2)
    │       │   └── ButtonComponent (x3)
    │       ├── PriceChartComponent
    │       │   ├── CardComponent
    │       │   └── ButtonComponent (x10)
    │       └── MarketPairsTableComponent
    │           ├── CardComponent
    │           ├── ButtonComponent (x4)
    │           └── BadgeComponent (x4)
    │
    └── FooterComponent
```

## 🔀 Data Flow

```
User Action
    ↓
Component
    ↓
Service (ApiService, ThemeService, etc.)
    ↓
Observable/Signal
    ↓
Component Property
    ↓
Template (HTML)
    ↓
UI Update
```

## 📦 Module Dependencies

```
app.component.ts
    └── uses: ThemeService

dashboard.page.ts
    └── uses: ApiService
    └── imports: CryptoTableComponent

crypto-table.component.ts
    └── uses: ApiService, Router
    └── imports: ButtonComponent, CardComponent, SparklineComponent

coin.page.ts
    └── uses: ApiService, ActivatedRoute
    └── imports: CoinStatsComponent, PriceChartComponent, MarketPairsTableComponent

shell.component.ts
    └── imports: HeaderComponent, TopbarMarketStripComponent, FooterComponent

header.component.ts
    └── imports: ButtonComponent, FormsModule, RouterModule
```

## 🎨 Style Architecture

```
global.scss (TailwindCSS + Custom)
    ├── @tailwind base
    ├── @tailwind components
    ├── @tailwind utilities
    ├── CSS Variables (colors)
    ├── Base styles
    ├── Scrollbar styling
    └── Animations

Component styles (*.scss)
    └── Component-specific overrides (mostly empty, using Tailwind)
```

## 🛣️ Route Structure

```
/ (ShellComponent)
    ├── '' → DashboardPage (/)
    ├── 'markets' → DashboardPage (/markets)
    ├── 'coin/:symbol' → CoinPage (/coin/btc)
    └── '**' → Redirect to ''
```

## 📱 Responsive Breakpoints

```scss
// Mobile
@media (max-width: 767px) { ... }

// Tablet
@media (min-width: 768px) and (max-width: 1023px) { ... }

// Desktop
@media (min-width: 1024px) { ... }
```

## 🎨 Color Palette

```scss
:root {
  --background: 222 15% 8%;      // #14171F (Dark slate)
  --card: 222 15% 12%;           // #1A1D28 (Dark blue)
  --primary: 216 100% 45%;       // #3861FB (Blue)
  --secondary: 142 76% 65%;      // #16C784 (Green)
  --accent: 0 84% 60%;           // #EA3943 (Red)
  --foreground: 0 0% 98%;        // #FAFAFA (White)
  --muted-foreground: 215 16% 65%; // #7B7F8E (Gray)
}
```

## 🚀 Build Output

```
dist/
└── crypto-dashboard/
    ├── index.html
    ├── main.*.js
    ├── polyfills.*.js
    ├── styles.*.css
    └── assets/
```

---

**This structure follows Angular best practices and matches your exact requirements! 🎉**

