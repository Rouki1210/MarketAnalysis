# Crypto Dashboard - Angular

A modern cryptocurrency market dashboard built with Angular 18, inspired by CoinMarketCap.

## Features

- 📊 Real-time cryptocurrency price tracking
- 📈 Interactive price charts
- 🎨 Dark theme UI matching CoinMarketCap design
- 🔍 Search and filter cryptocurrencies
- 💱 Multiple currency support (USD, VND, BTC, ETH)
- 📱 Responsive design
- ⚡ Fast and optimized with Angular Signals
- 🎯 Standalone components architecture

## Tech Stack

- **Framework**: Angular 18 (Standalone Components)
- **Styling**: TailwindCSS
- **State Management**: Angular Signals
- **HTTP**: Angular HttpClient
- **Routing**: Angular Router
- **Icons**: Lucide Angular
- **Charts**: Chart.js

## Project Structure

```
src/
├── app/
│   ├── core/                    # Singleton services & infrastructure
│   │   ├── services/            # API, Theme, Currency, Realtime services
│   │   ├── models/              # TypeScript interfaces & types
│   │   └── interceptors/        # HTTP interceptors
│   ├── shared/                  # Reusable components & utilities
│   │   ├── components/          # Button, Card, Badge, etc.
│   │   └── pipes/               # Format pipes
│   ├── layout/                  # App shell & layout components
│   │   ├── shell/
│   │   ├── header/
│   │   ├── topbar-market-strip/
│   │   └── footer/
│   ├── features/                # Feature modules (lazy loaded)
│   │   ├── dashboard/           # Main crypto table page
│   │   └── coin/                # Coin detail page
│   ├── app.routes.ts
│   └── app.config.ts
├── styles/
│   └── global.scss
└── index.html
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Angular CLI 18+

### Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Start the development server:

\`\`\`bash
npm start
\`\`\`

4. Open your browser and navigate to `http://localhost:4200`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run watch` - Build in watch mode

## Key Features Implementation

### 1. Dashboard (Main Page)
- Crypto table with sorting and filtering
- Network filters (Bitcoin, Ethereum, BSC, Solana, etc.)
- Tab navigation (Top, Trending, Most Visited, etc.)
- Sparkline charts for 7-day price trends
- Real-time price updates

### 2. Coin Detail Page
- Comprehensive coin statistics
- Interactive price charts with multiple timeframes
- Market pairs table showing trading data from exchanges
- Links to website and whitepaper

### 3. Layout Components
- **Header**: Navigation, search, portfolio, and watchlist links
- **Topbar Market Strip**: Global market stats (Market Cap, Volume, Dominance, Fear & Greed Index)
- **Footer**: Copyright and attribution

### 4. Core Services
- **ApiService**: Handles all API calls (currently using mock data)
- **ThemeService**: Dark/light theme management
- **CurrencyService**: Multi-currency support and conversion
- **RealtimeService**: WebSocket/real-time price updates

## Styling

The application uses TailwindCSS with a custom color palette matching CoinMarketCap's dark theme:

- Primary: Blue (#3861FB)
- Secondary: Green (for positive price changes)
- Accent: Red (for negative price changes)
- Background: Dark slate (#14171F)
- Card: Darker blue (#1A1D28)

## API Integration

Currently using mock data. To integrate with real APIs:

1. Update `ApiService` in `src/app/core/services/api.service.ts`
2. Replace mock data with actual API calls to services like:
   - CoinGecko API
   - CoinMarketCap API
   - Binance API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is for educational purposes.

## Acknowledgments

- Design inspired by [CoinMarketCap](https://coinmarketcap.com/)
- Icons from [Lucide](https://lucide.dev/)

