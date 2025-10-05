# Setup Instructions

## Prerequisites

Make sure you have the following installed:
- Node.js 18+ (https://nodejs.org/)
- npm (comes with Node.js)

## Installation Steps

### 1. Install Dependencies

```bash
cd /Users/vuxphamj/Downloads/Frontend
npm install
```

This will install all required packages including:
- Angular 18
- TailwindCSS
- Lucide Angular (icons)
- And all other dependencies

### 2. Start Development Server

```bash
npm start
```

The application will be available at `http://localhost:4200`

### 3. Build for Production

```bash
npm run build
```

Production build will be in the `dist/` folder.

## Project Overview

This is a complete conversion of your React crypto-dashboard to Angular 18 with:

### ✅ Completed Features

1. **Core Architecture**
   - Singleton services (API, Theme, Currency, Realtime)
   - TypeScript models and interfaces
   - HTTP client setup

2. **Shared Components**
   - Button, Card, Badge, Skeleton components
   - Sparkline chart component
   - Pipes for formatting (currency, numbers, percentages, time)

3. **Layout**
   - Shell component with routing
   - Header with navigation and search
   - Market stats topbar
   - Footer

4. **Features**
   - **Dashboard**: Main crypto table with filters and sorting
   - **Coin Detail**: Individual coin page with stats, charts, and market pairs
   - Network filtering (Bitcoin, Ethereum, BSC, Solana, etc.)
   - Tab navigation

5. **Styling**
   - TailwindCSS configured
   - Dark theme matching CoinMarketCap
   - Custom color palette (blue primary, green for gains, red for losses)
   - Responsive design

### 🎨 Color Scheme (CoinMarketCap Style)

- **Background**: Dark slate (#14171F)
- **Cards**: Darker blue (#1A1D28)
- **Primary**: Blue (#3861FB)
- **Secondary (Gains)**: Green (#16C784)
- **Accent (Losses)**: Red (#EA3943)
- **Text**: White (#FFFFFF)
- **Muted Text**: Gray (#7B7F8E)

### 📁 Folder Structure

```
src/app/
├── core/                    # Services, models, interceptors
│   ├── services/            # API, Theme, Currency, Realtime
│   └── models/              # TypeScript interfaces
├── shared/                  # Reusable components
│   ├── components/          # Button, Card, Badge, etc.
│   └── pipes/               # Format pipes
├── layout/                  # App shell & layout
│   ├── header/
│   ├── topbar-market-strip/
│   ├── footer/
│   └── shell/
├── features/                # Lazy-loaded features
│   ├── dashboard/           # Main page with crypto table
│   └── coin/                # Coin detail page
├── app.routes.ts
└── app.config.ts
```

### 🔄 Key Differences from React Version

1. **State Management**: Uses Angular Signals instead of useState/useEffect
2. **Routing**: Angular Router with lazy loading
3. **Styling**: Same TailwindCSS but with Angular syntax
4. **Components**: Standalone components (no NgModules)
5. **Data Fetching**: RxJS Observables instead of Promises

### 🚀 Next Steps

If you want to integrate real APIs:

1. Update `src/app/core/services/api.service.ts`
2. Replace mock data with actual API calls:
   - CoinGecko: https://www.coingecko.com/en/api
   - CoinMarketCap: https://coinmarketcap.com/api/
   - Binance: https://binance-docs.github.io/apidocs/

3. Update the RealtimeService for WebSocket connections

### 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

All tables and layouts are fully responsive.

## Troubleshooting

### Port 4200 already in use

```bash
ng serve --port 4300
```

### Module not found errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### TailwindCSS not working

Make sure `global.scss` is imported in `angular.json` under styles.

## Support

For issues or questions, refer to:
- Angular Documentation: https://angular.dev
- TailwindCSS: https://tailwindcss.com/docs

