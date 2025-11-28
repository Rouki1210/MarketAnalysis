# 📊 MarketAnalysis

**MarketAnalysis** is a comprehensive full-stack cryptocurrency and market data analysis platform featuring real-time price tracking, **AI-powered analysis with Google Gemini 2.0**, social features, and advanced alert systems. The project consists of **four main applications**: an **Angular web app** for users, a **Flutter mobile app**, an **ASP.NET Core 8 backend API**, and an **Angular admin panel** for management.

---

## 🚀 Overview

MarketAnalysis is a complete ecosystem for cryptocurrency market analysis and community engagement:

- **Web App**: Angular-based web application for desktop users (MarketAnalysisFrontend)
- **Mobile App**: Flutter-based cross-platform mobile application for iOS & Android (marketanalysisapp)
- **Admin Panel**: Angular-based admin dashboard for management and moderation (MarketAnalysisAdmin)
- **Backend API**: ASP.NET Core 8 RESTful API with SignalR real-time communication (MarketAnalysisBackend)
- **Database**: PostgreSQL with Entity Framework Core
- **Real-time**: SignalR hubs for live price updates, global metrics, alerts, and notifications
- **AI Integration**: **Google Gemini 2.0 Flash** powered market and coin analysis with 1-hour caching
- **Authentication**: JWT-based auth with Google OAuth2 and Web3 wallet support

---

## 📁 Project Structure

```
MarketAnalysis/
├── MarketAnalysisFrontend/     # Angular Web Application (User-facing)
│   ├── src/
│   │   ├── app/               # Angular components & services
│   │   │   ├── features/      # Feature modules
│   │   │   │   ├── dashboard/ # Market dashboard with AI insights
│   │   │   │   ├── coin/      # Coin details with AI analysis
│   │   │   │   ├── community/ # Social features
│   │   │   │   └── profile/   # User profile settings
│   │   │   ├── shared/        # Shared components
│   │   │   │   └── components/
│   │   │   │       ├── market-ai-button/          # AI button (glassmorphism)
│   │   │   │       └── market-overview-chat/      # Market AI widget
│   │   │   └── core/          # Core services
│   │   └── environments/      # Environment configurations
│   └── package.json
│
├── marketanalysisapp/          # Flutter Mobile Application
│   ├── lib/
│   │   ├── config/             # App configuration
│   │   ├── core/               # Core utilities and constants
│   │   ├── models/             # Data models
│   │   │   ├── market_overview_model.dart  # Market AI response
│   │   │   └── coin_analysis_model.dart    # Coin AI response
│   │   ├── repositories/       # Data layer
│   │   │   └── market_ai_repository.dart   # AI API integration
│   │   ├── services/           # Business logic services
│   │   ├── viewmodels/         # MVVM view models
│   │   ├── views/              # UI screens
│   │   │   ├── markets/        # Markets screen with AI FAB
│   │   │   ├── market/         # Coin detail with AI analysis
│   │   │   └── profile/        # Profile settings
│   │   └── widgets/            # Reusable UI components
│   │       ├── market_ai_fab.dart          # AI FAB (glassmorphism)
│   │       ├── market_overview_sheet.dart  # Market AI bottom sheet
│   │       └── coin_analysis_sheet.dart    # Coin AI bottom sheet
│   └── pubspec.yaml
│
├── MarketAnalysisAdmin/        # Angular Admin Panel (Management)
│   ├── src/
│   │   └── app/               # Angular components & services
│   └── package.json
│
├── MarketAnalysisBackend/      # ASP.NET Core 8 Backend API
│   ├── Controllers/            # API endpoints (20 controllers)
│   │   └── AIAnalysisController.cs  # AI analysis endpoints
│   ├── Models/                 # Database models
│   ├── Repositories/           # Data access layer
│   ├── Services/               # Business logic
│   │   └── Implementations/
│   │       └── GeminiAiAnalysisService.cs  # Gemini 2.0 integration
│   ├── Hubs/                   # SignalR real-time hubs (5 hubs)
│   ├── Migrations/             # EF Core migrations
│   └── Program.cs
│
└── README.md
```

---

## 🌟 Key Features

### 🤖 **AI-Powered Analysis (NEW!)**

#### **Google Gemini 2.0 Flash Integration**

- **Market Overview Analysis**: Comprehensive market insights
  - Overall trend analysis (Bullish/Bearish/Neutral)
  - 4 key market statistics (Market Cap, Volume, Dominance, Breadth)
  - 3-5 AI-generated insights (positive/negative/neutral)
  - Top 5 gainers and losers with analysis
  - Auto-cached for 1 hour to optimize API costs
- **Coin-Specific Analysis**: Detailed asset analysis
  - Current price and 7-day trend evaluation
  - 4-5 AI insights per coin
  - Support/resistance level analysis
  - Volume and momentum indicators
  - Auto-cached for 1 hour

#### **Web Frontend Features**

- 🤖 **Glassmorphism AI Button**: Floating button with backdrop blur effect (bottom-right)
- 💬 **Market Overview Chat Widget**: Full-screen modal with comprehensive market data
- 📊 **Coin Analysis Panel**: Dedicated AI analysis section on coin detail pages
- 🎨 **Modern UI/UX**: Semi-transparent buttons (30% opacity) with 10px blur
- ✅ **English Language**: All AI responses in English

#### **Mobile App Features**

- 🤖 **AI FAB (Floating Action Button)**: Glassmorphism design with 30% opacity
- 📱 **Market Overview Bottom Sheet**: Draggable sheet (50%-95% screen height)
  - Trend badge with color indicators
  - Stats grid (2×2 layout)
  - Scrollable insights list
  - Top 5 gainers/losers
- 📊 **Coin Analysis Bottom Sheet**: Per-coin AI insights
  - Price info card
  - Color-coded insight cards
  - Disclaimer warning
  - Extended FAB with "AI Analysis" label

### 🔐 Authentication & User Management

- Email/password registration and login
- Google OAuth 2.0 authentication
- Web3 wallet authentication (MetaMask, WalletConnect)
- JWT-based secure API access
- **Profile Settings** (Web & Mobile):
  - Display name (20 chars max)
  - Username (disabled - 7-day change restriction)
  - Bio (250 chars max, multiline)
  - Birthday (date picker)
  - Website URL (100 chars max)
  - Avatar display with initial
- Role-based access control (Admin/User)

### 📈 Market Data & Tracking

- **Real-time Price Tracking**: Live cryptocurrency and asset prices via SignalR
- **Multi-Asset Support**: Bitcoin, Ethereum, Gold, and 100+ cryptocurrencies
- **Historical Data**: 30-day price history with OHLCV data
- **Global Market Metrics**: Total market cap, 24h volume, BTC/ET dominance
- **Fear & Greed Index**: Market sentiment indicator
- **Visual Charts**: Interactive price charts using FL Chart (mobile) and Chart.js (web)
- **Enhanced Mobile UI**: Improved global metrics visibility (bold fonts, white70 colors)

### 🎯 Watchlist & Alerts

- **Personal Watchlists**: Create and manage multiple asset watchlists
- **Price Alerts**: Set custom price alerts (above/below thresholds)
- **Alert Notifications**: Real-time push notifications when alerts trigger
- **Alert History**: Track all triggered alerts
- **Auto-Alerts**: Automatic alerts for watchlist items
- **Mobile Clear Filters**: Quick reset button for Market Cap/Volume sorting

### 👥 Community Features

- **Community Posts**: Create and share market insights
- **Reactions**: Like/dislike posts
- **Comments**: Engage in discussions
- **Bookmarks**: Save important posts
- **Topics**: Organize posts by topics
- **User Following**: Follow other traders
- **Topic Following**: Subscribe to specific topics
- **View Counts**: Track post popularity

### 📰 News & Articles

- **Market News**: Curated cryptocurrency news
- **Article Management**: Admin-controlled content
- **Rich Media**: Support for images and external links

### 🔔 Notification System

- **Real-time Notifications**: SignalR-powered instant notifications
- **Alert Notifications**: Price alert triggers
- **Community Notifications**: Post interactions (likes, comments, follows)
- **Notification History**: Persistent notification storage
- **Read/Unread Status**: Track notification engagement

### 📊 Admin Panel (Angular)

- **User Management**: View and manage users
- **Content Moderation**: Manage posts, articles, topics
- **System Analytics**: Monitor platform usage
- **Dark Mode**: Full dark theme support

---

## ⚙️ Technology Stack

### Backend (MarketAnalysisBackend)

- **Framework**: ASP.NET Core 8.0
- **Database**: PostgreSQL with Npgsql
- **ORM**: Entity Framework Core 9.0
- **Authentication**: JWT Bearer + Google OAuth + Web3
- **Real-time**: SignalR (WebSockets)
- **AI**: **Google Gemini 2.0 Flash** (GenerativeAI SDK)
- **Blockchain**: Nethereum (Web3 integration)
- **Password Hashing**: BCrypt.Net
- **API Documentation**: Swagger/OpenAPI
- **Caching**: In-memory cache for AI responses (1-hour TTL)

### Mobile App (marketanalysisapp)

- **Framework**: Flutter SDK 3.10+
- **Architecture**: MVVM (Model-View-ViewModel)
- **State Management**: Provider
- **HTTP Client**: http package
- **Authentication**: Supabase Flutter SDK
- **Real-time**: SignalR NetCore client
- **Storage**: Shared Preferences, Flutter Secure Storage
- **Charts**: FL Chart
- **Images**: Cached Network Image
- **OAuth**: Google Sign-In
- **UI Effects**: Backdrop Filter (glassmorphism)

### Web App (MarketAnalysisFrontend)

- **Framework**: Angular 18
- **Language**: TypeScript
- **Styling**: CSS/SCSS with modern glassmorphism effects
- **HTTP**: RxJS
- **Build Tool**: Angular CLI
- **Authentication**: Google OAuth 2.0 Integration
- **UI Features**: Backdrop blur, semi-transparent elements

### Admin Panel (MarketAnalysisAdmin)

- **Framework**: Angular 20
- **Language**: TypeScript 5.9
- **Styling**: TailwindCSS 3.4
- **HTTP**: RxJS 7.8
- **Build Tool**: Angular CLI
- **Testing**: Jasmine + Karma
- **Features**: Dark mode support

---

## 🛠️ Setup Instructions

### Prerequisites

- **.NET 8 SDK** or later
- **PostgreSQL** 14+ database
- **Flutter SDK** 3.10+ (for mobile app)
- **Node.js** 18+ and npm (for web apps)
- **Google Gemini API Key** (for AI features) - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Google OAuth Credentials** (for Google login)

---

### 1️⃣ Backend Setup (ASP.NET Core 8)

#### Step 1: Navigate to backend directory

```bash
cd MarketAnalysisBackend
```

#### Step 2: Install dependencies

```bash
dotnet restore
```

#### Step 3: Configure appsettings.json

Create or edit `appsettings.json` with your credentials:

```json
{
  "ConnectionStrings": {
    "DbConnection": "Host=localhost;Database=MarketAnalysis;Username=postgres;Password=your_password"
  },
  "Jwt": {
    "Key": "your-super-secret-jwt-key-min-32-characters",
    "Issuer": "MarketAnalysis",
    "Audience": "MarketAnalysisUsers"
  },
  "Authentication": {
    "Google": {
      "ClientId": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
      "ClientSecret": "YOUR_GOOGLE_CLIENT_SECRET"
    }
  },
  "Gemini": {
    "ApiKey": "YOUR_GEMINI_API_KEY_HERE",
    "Model": "gemini-2.0-flash-exp"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

#### Step 4: Run database migrations

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

#### Step 5: Run the backend

```bash
dotnet run
```

The API will be available at: `https://localhost:7175` (or configured port)

API Documentation (Swagger): `https://localhost:7175/swagger`

---

### 2️⃣ Web App Setup (Angular - MarketAnalysisFrontend)

#### Step 1: Navigate to web app directory

```bash
cd MarketAnalysisFrontend
```

#### Step 2: Install dependencies

```bash
npm install
```

#### Step 3: Configure environment

Create or update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: "https://localhost:7175",
  googleClientId: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  googleRedirectUri: "http://localhost:4200",
};
```

#### Step 4: Start development server

```bash
npm start
# or
ng serve --port 4200
```

The web app will be available at: `http://localhost:4200`

---

### 3️⃣ Mobile App Setup (Flutter)

#### Step 1: Navigate to mobile app directory

```bash
cd marketanalysisapp
```

#### Step 2: Install Flutter dependencies

```bash
flutter pub get
```

#### Step 3: Configure API endpoint

Update the API base URL in your configuration file:

```dart
// lib/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'https://your-backend-url.com';
  static const String signalRHub = 'https://your-backend-url.com/pricehub';
}
```

#### Step 4: Configure Google Sign-In

**For Android:**
Add your Google OAuth client ID to `android/app/src/main/res/values/strings.xml`:

```xml
<string name="default_web_client_id">YOUR_GOOGLE_CLIENT_ID</string>
```

**For iOS:**
Update `ios/Runner/Info.plist` with your Google OAuth URL scheme.

#### Step 5: Run the app

```bash
# For iOS
flutter run -d ios

# For Android
flutter run -d android

# For Chrome (web)
flutter run -d chrome
```

---

### 4️⃣ Admin Panel Setup (Angular - MarketAnalysisAdmin)

#### Step 1: Navigate to admin panel directory

```bash
cd MarketAnalysisAdmin
```

#### Step 2: Install dependencies

```bash
npm install
```

#### Step 3: Configure environment

Create or update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: "https://localhost:7175/api",
};
```

#### Step 4: Run development server

```bash
npm start
# or
ng serve
```

The admin panel will be available at: `http://localhost:4200`

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description                     |
| ------ | -------------------- | ------------------------------- |
| `POST` | `/api/Auth/register` | Register new user               |
| `POST` | `/api/Auth/login`    | Login with email/password       |
| `POST` | `/api/Auth/google`   | Login/register via Google OAuth |
| `POST` | `/api/Auth/wallet`   | Login/register via Web3 wallet  |

### Assets & Prices

| Method | Endpoint               | Description                  |
| ------ | ---------------------- | ---------------------------- |
| `GET`  | `/api/Asset`           | Get all assets               |
| `GET`  | `/api/Prices/{symbol}` | Get price for specific asset |
| `GET`  | `/api/GlobalMetric`    | Get global market metrics    |

### Watchlists & Alerts

| Method   | Endpoint          | Description          |
| -------- | ----------------- | -------------------- |
| `GET`    | `/api/Watchlist`  | Get user watchlists  |
| `POST`   | `/api/Watchlist`  | Create new watchlist |
| `POST`   | `/api/Alert`      | Create price alert   |
| `GET`    | `/api/Alert`      | Get user alerts      |
| `DELETE` | `/api/Alert/{id}` | Delete alert         |

### AI Analysis (NEW!)

| Method | Endpoint                   | Description                       |
| ------ | -------------------------- | --------------------------------- |
| `GET`  | `/api/AIAnalysis/market`   | Get comprehensive market overview |
| `GET`  | `/api/AIAnalysis/{symbol}` | Get AI analysis for specific coin |

**Response Example (Market Overview)**:

```json
{
  "analyzedAt": "2024-11-28T12:00:00Z",
  "overallTrend": "Bullish",
  "insights": [
    {
      "title": "Strong Market Recovery",
      "description": "Bitcoin leading the rally above $35K...",
      "type": "positive"
    }
  ],
  "topGainers": [...],
  "topLosers": [...],
  "statistics": {
    "totalMarketCap": 3120000000000,
    "totalVolume24h": 110650000000,
    "btcDominance": 58.6,
    "marketBreadth": 0.68
  }
}
```

### Community

| Method | Endpoint                           | Description         |
| ------ | ---------------------------------- | ------------------- |
| `GET`  | `/api/CommunityPost`               | Get community posts |
| `POST` | `/api/CommunityPost`               | Create new post     |
| `POST` | `/api/Comment`                     | Add comment to post |
| `POST` | `/api/CommunityPost/{id}/react`    | Like/dislike post   |
| `POST` | `/api/CommunityPost/{id}/bookmark` | Bookmark post       |

### Topics & Articles

| Method | Endpoint        | Description       |
| ------ | --------------- | ----------------- |
| `GET`  | `/api/Topic`    | Get all topics    |
| `POST` | `/api/Topic`    | Create new topic  |
| `GET`  | `/api/Articles` | Get news articles |

### Notifications

| Method   | Endpoint                      | Description               |
| -------- | ----------------------------- | ------------------------- |
| `GET`    | `/api/Notification`           | Get user notifications    |
| `PUT`    | `/api/Notification/{id}/read` | Mark notification as read |
| `DELETE` | `/api/Notification/{id}`      | Delete notification       |

### User Management

| Method | Endpoint                           | Description           |
| ------ | ---------------------------------- | --------------------- |
| `GET`  | `/api/User/userInfo/{token}`       | Get current user info |
| `PUT`  | `/api/User/updateProfile`          | Update user profile   |
| `POST` | `/api/UserFollows/{userId}/follow` | Follow a user         |

---

## 🔄 SignalR Real-time Hubs

The backend provides multiple SignalR hubs for real-time communication:

| Hub                 | Endpoint           | Description                |
| ------------------- | ------------------ | -------------------------- |
| **PriceHub**        | `/pricehub`        | Live asset price updates   |
| **GlobalMetricHub** | `/globalmetrichub` | Global market metrics      |
| **AlertHub**        | `/alerthub`        | Global alert notifications |
| **UserAlertHub**    | `/useralerthub`    | Personal alert triggers    |
| **NotificationHub** | `/notificationhub` | User notifications         |

**Connection Example (Flutter):**

```dart
final connection = HubConnectionBuilder()
  .withUrl('https://your-api.com/pricehub',
    options: HttpConnectionOptions(
      accessTokenFactory: () async => yourJwtToken,
    ))
  .build();

await connection.start();

connection.on('ReceivePriceUpdate', (arguments) {
  final priceData = arguments?[0];
  // Handle price update
});
```

---

## 🤖 AI Analysis Flow

### Market Overview Analysis

1. User clicks AI button (web/mobile)
2. Backend retrieves market data from database
3. System generates prompt with:
   - Top 100 coins data
   - Global market metrics
   - 24h price changes
   - Volume data
4. **Google Gemini 2.0 Flash** analyzes the data
5. AI returns:
   - Overall trend (Bullish/Bearish/Neutral)
   - 3-5 market insights
   - Top 5 gainers/losers
   - Market statistics
6. Results cached for 1 hour
7. Frontend displays in modal/bottom sheet

### Coin-Specific Analysis

1. User requests analysis for specific coin (e.g., BTC)
2. Backend retrieves 30 days of price history
3. System generates prompt with price data, trends, statistics
4. **Google Gemini 2.0 Flash** analyzes the coin
5. AI returns 4-5 insights (positive/negative/neutral)
6. Results cached for 1 hour
7. Frontend displays insights with visual indicators

**Cost Optimization:**

- 1-hour caching reduces API calls by ~95%
- Each market analysis: ~$0.01-$0.02
- Each coin analysis: ~$0.005-$0.01
- Gemini 2.0 Flash is 50% cheaper than GPT-4
- Rate limiting prevents abuse

---

## 🎨 UI/UX Enhancements

### Glassmorphism Design

- **AI Buttons**: 30% opacity with 10px backdrop blur
- **Semi-transparent backgrounds**: Modern frosted glass effect
- **Hover states**: 50% opacity on web
- **Border accents**: 2px borders with 50% opacity

### Mobile Improvements

- **Global Metrics**: Enhanced visibility (bold fonts, white70 colors)
- **Clear Filters**: Quick reset for Market Cap/Volume sorting
- **Draggable Sheets**: Smooth 50-95% screen height modals
- **Gainers Tab**: Shows all 100 coins sorted by 24h change

### Web Features

- **Floating AI Button**: Bottom-right position with glassmorphism
- **Market Chat Widget**: Full-screen modal with comprehensive data
- **Auto-hide Button**: Button disappears when modal is open

---

## 🔒 Authentication Flow

### Email/Password Flow

1. User registers with email, username, and password
2. Password is hashed with BCrypt
3. User credentials stored in database
4. Login returns JWT token (24-hour expiration)
5. Token included in `Authorization: Bearer {token}` header

### Google OAuth Flow

1. Frontend initiates Google OAuth 2.0 code flow
2. User authenticates with Google
3. Authorization code sent to `/api/Auth/google`
4. Backend exchanges code for Google tokens
5. User info extracted from `id_token`
6. New user auto-created if doesn't exist
7. JWT token generated and returned
8. Frontend stores JWT for API requests

### Web3 Wallet Flow

1. User connects MetaMask/WalletConnect
2. Frontend requests wallet signature
3. Signature sent to `/api/Auth/wallet`
4. Backend verifies signature
5. JWT token generated and returned

---

## 📊 Database Schema

### Core Entities

- **User**: User accounts and profiles (with displayName, bio, website, birthday)
- **Asset**: Cryptocurrencies and tradable assets
- **PricePoint**: Historical OHLCV price data
- **Watchlist**: User watchlists
- **WatchlistItems**: Assets in watchlists

### Alert System

- **GlobalAlert**: System-wide alert definitions
- **UserAlert**: User-created price alerts
- **UserAlertHistory**: Triggered alert records

### Community

- **CommunityPost**: User posts and discussions
- **Comment**: Post comments
- **PostReaction**: Likes/dislikes
- **PostBookmark**: Saved posts
- **Topic**: Discussion topics
- **PostTopic**: Post-topic relationships
- **Article**: News articles

### Social

- **UserFollow**: User following relationships
- **TopicFollow**: Topic subscriptions

### Notifications

- **CommunityNotification**: Community interaction notifications

---

## 🎨 Mobile App Features

### Screens

- **Authentication**: Login, Register, Google OAuth, Web3 Wallet
- **Home**: Dashboard with Fear & Greed index
- **Markets**: Browse all assets with real-time prices + AI FAB
- **Market Detail**: Detailed asset view with charts + AI Analysis button
- **Watchlist**: Manage watchlists and alerts
- **Alerts**: Create and manage price alerts
- **Community**: Browse posts, create content
- **Post Detail**: View post with comments and reactions
- **Profile**: User profile and settings
- **Profile Settings**: Edit display name, bio, birthday, website
- **Notifications**: View all notifications

### UI Components

- Real-time price charts (candlestick, line)
- Pull-to-refresh functionality
- Infinite scroll pagination
- Shimmer loading effects
- Cached network images
- Bottom navigation
- Custom dialogs and modals
- Glassmorphism AI buttons
- Draggable bottom sheets

---

## 🔔 Notification Types

| Type              | Trigger                       | Description                   |
| ----------------- | ----------------------------- | ----------------------------- |
| **Price Alert**   | Alert threshold reached       | "BTC reached $35,000"         |
| **Post Reaction** | Someone likes your post       | "John liked your post"        |
| **Comment**       | Someone comments on your post | "Jane commented on your post" |
| **Follow**        | Someone follows you           | "Bob started following you"   |
| **Topic Follow**  | New post in followed topic    | "New post in 'Bitcoin' topic" |

---

## 🌓 Dark Mode Support

All applications feature dark theme implementations with:

- Persistent theme preference storage
- Toggle switch in navigation
- Optimized dark color palette
- All components theme-aware
- Modern glassmorphism effects

---

## ⚠️ Important Security Notes

1. **Never commit sensitive data to Git:**

   - `appsettings.json` is in `.gitignore`
   - Use environment variables for production
   - Use `appsettings.example.json` for templates

2. **Configure CORS properly:**

   - Backend CORS allows specified origins
   - Update CORS policy for production domains

3. **Secure JWT tokens:**

   - Use strong secret key (min 32 characters)
   - Set appropriate token expiration
   - Implement refresh token mechanism for production

4. **Google OAuth Configuration:**

   - Add authorized redirect URIs in Google Cloud Console
   - Set OAuth consent screen to "External" for public access
   - Keep client secrets secure

5. **Gemini API Key:**

   - Keep API key secure in `appsettings.json`
   - Never expose in client-side code
   - Monitor usage in Google AI Studio

6. **Database Security:**
   - Use strong PostgreSQL passwords
   - Enable SSL for production databases
   - Implement database backups

---

## 🚀 Deployment

### Backend Deployment

- **Docker**: Dockerfile included for containerization
- **Cloud Platforms**: Deploy to Azure, AWS, or Google Cloud
- **Database**: Use managed PostgreSQL (Azure Database, AWS RDS, etc.)

### Mobile App Deployment

- **iOS**: Build with Xcode, deploy via App Store Connect
- **Android**: Build APK/AAB, deploy via Google Play Console
- **Code Signing**: Configure signing certificates for both platforms

### Web App Deployment

- **Build for production**: `ng build --configuration production`
- **Static Hosting**: Deploy to Vercel, Netlify, or Firebase Hosting
- **Nginx/Apache**: Serve built files with web server

### Admin Panel Deployment

- **Build for production**: `ng build --configuration production`
- **Static Hosting**: Deploy to Vercel, Netlify, or Firebase Hosting

---

## 🧪 Testing

### Backend Testing

```bash
cd MarketAnalysisBackend
dotnet test
```

### Mobile App Testing

```bash
cd marketanalysisapp
flutter test
```

### Web App Testing

```bash
cd MarketAnalysisFrontend
npm test
```

### Admin Panel Testing

```bash
cd MarketAnalysisAdmin
npm test
```

---

## 🔧 Troubleshooting

### Backend Issues

- **Database connection fails**: Check PostgreSQL is running and credentials are correct
- **JWT errors**: Verify JWT secret key is properly configured
- **SignalR connection fails**: Ensure WebSocket support is enabled
- **Gemini API errors**: Verify API key is correct and has quota

### Mobile App Issues

- **API connection fails**: Verify backend URL is correct and accessible
- **Build errors**: Run `flutter clean` and `flutter pub get`
- **SignalR disconnects**: Check network stability and JWT token validity
- **AI features not working**: Ensure backend AI endpoints are accessible

### Web App Issues

- **Cannot login**: Ensure backend API is running
- **CORS errors**: Verify CORS policy includes frontend URL
- **AI button not visible**: Check if glassmorphism CSS is loaded

### Admin Panel Issues

- **Cannot login**: Ensure backend API is running
- **CORS errors**: Verify CORS policy includes admin URL

---

## 🌟 Future Enhancements

- Advanced technical indicators (RSI, MACD, Bollinger Bands)
- User portfolio management
- Trading simulation mode
- Multi-language support
- Advanced AI predictions (price forecasting)
- WebSocket optimization
- Push notifications for mobile
- Social sharing and referral system
- AI sentiment analysis from news
- Voice commands for AI queries

---

## 👥 Contributors

| Avatar                                                                                         | Name                            | Role                                 | GitHub                                    |
| ---------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------ | ----------------------------------------- |
| <img src="https://github.com/Rouki1210.png" width="50" height="50" style="border-radius:50%;"> | **Vinh Nguyen (Rouki1210)**     | Full-Stack Developer / Project Owner | [Rouki1210](https://github.com/Rouki1210) |
| <img src="https://github.com/25thnovvv.png" width="50" height="50" style="border-radius:50%;"> | **Pham Huu Anh Vu (25thnovvv)** | Frontend Developer                   | [25thnovvv](https://github.com/25thnovvv) |
| <img src="https://github.com/Kim2k4.png" width="50" height="50" style="border-radius:50%;">    | **Kim2k4**                      | Frontend Developer                   | [Kim2k4](https://github.com/Kim2k4)       |

---

## 📞 Contact & Support

**Project Owner:** Vinh Nguyen  
**GitHub:** [Rouki1210](https://github.com/Rouki1210)  
**Email:** vinh12102004@gmail.com  
**Repository:** [MarketAnalysis](https://github.com/Rouki1210/MarketAnalysis)

---

## 📜 License

This project is licensed under the **MIT License**.

```
MIT © 2025 Vinh Nguyen (Rouki1210)
```

Feel free to use, modify, and distribute this project with proper attribution.

---

## 🙏 Acknowledgments

- **Google** for Gemini 2.0 AI API
- **Flutter Team** for the amazing mobile framework
- **Microsoft** for ASP.NET Core and SignalR
- **Angular Team** for the robust web framework
- **PostgreSQL** for the reliable database system

---

<div align="center">

**Made with ❤️ by the MarketAnalysis Team**

⭐ Star this repo if you find it useful!

**Powered by Google Gemini 2.0 Flash 🤖**

</div>
