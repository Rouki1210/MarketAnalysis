# MarketAnalysis AI Agent Instructions

## Architecture Overview

**MarketAnalysis** is a full-stack crypto/market analytics platform with three main applications:

1. **MarketAnalysisFrontend** - User-facing Angular 18 app for market data & community features
2. **MarketAnalysisAdmin** - Admin dashboard Angular 20 app with dark mode
3. **MarketAnalysisBackend** - ASP.NET Core 8 API with real-time SignalR hubs

### Key Architectural Patterns

**Backend**: Repository-Service pattern with dependency injection configured in `Program.cs`
- Controllers → Services → Repositories → DbContext (EF Core)
- All repositories implement `IGenericRepository<T>` for CRUD operations
- Services are scoped; background services use `IServiceScopeFactory` for scoped dependency access
- Community features are organized under `Models/Community`, `Repositories/*/Community`, `Services/*/Community`

**Frontend**: Feature-based module structure with lazy loading
- `core/` - Singleton services (auth, api, theme)
- `features/` - Feature modules (dashboard, coin, profile, community)
- `shared/` - Reusable components/pipes
- `layout/` - Shell components (header, sidebar, footer)
- Routes use `loadChildren` for code splitting

**Real-time Communication**: SignalR with group-based subscriptions
- `PriceHub` - Asset price updates, clients join/leave asset groups via `JoinAssetGroup(symbol)`
- `GlobalMetric` - Global market metrics broadcast
- `AlertHub` - User-specific alert notifications
- Hub URLs: `/pricehub`, `/globalmetrichub`, `/alerthub`

## Critical Workflows

### Backend Development

**Running locally**:
```bash
cd MarketAnalysisBackend
dotnet run  # Starts on https://localhost:7175
```

**Database migrations** (EF Core with PostgreSQL):
```bash
dotnet ef migrations add MigrationName
dotnet ef database update
```

**Docker deployment**:
```bash
docker compose up --build  # Uses compose.yaml, includes PostgreSQL container
```

**Configuration**: `appsettings.json` contains:
- `ConnectionStrings:DbConnection` - PostgreSQL connection (Supabase hosted or local)
- `Authentication:Google` - OAuth2 credentials
- `Jwt` - Token signing configuration
- `CoinMarketCap:ApiKey` - External API key

**Background Services** (registered in `Program.cs`):
- `PriceDataCollector` - Fetches prices for assets in active SignalR groups every 10s
- `GlobalMetricService` - Updates global market metrics periodically
- `AssetImporterService`, `GlobalAlertDetectorService` - Currently commented out

### Frontend Development

**MarketAnalysisFrontend** (user app):
```bash
cd MarketAnalysisFrontend
npm install
ng serve --port 4200  # Default Angular port
```

**MarketAnalysisAdmin** (admin dashboard):
```bash
cd MarketAnalysisAdmin
npm install
ng serve  # Uses default port 4200
```

**Important**: Both frontends use Tailwind CSS v3 (NOT v4 - see BUG_FIXES_SUMMARY.md)
- Global styles in `src/styles.css` with `@tailwind base/components/utilities`
- Component styles should NOT import Tailwind directives (causes budget bloat)
- Admin dashboard has dark mode: `darkMode: 'class'` in tailwind.config.js

### Authentication Flow

**Standard login/register**: Email + password → JWT token
**Google OAuth2**: Frontend gets auth code → POST to `/api/Auth/google` with code → Backend exchanges for tokens → Auto-registers new users → Returns JWT

JWT stored in localStorage, attached to requests via `Authorization: Bearer {token}`

## Project-Specific Conventions

### C# Backend

**Naming**: PascalCase for public members, camelCase with underscore prefix for private fields (`_userRepository`)

**Controller patterns**:
```csharp
[ApiController]
[Route("api/[controller]")]  // Results in /api/Auth, /api/Asset, etc.
```

**Service registration**: All in `Program.cs` using `AddScoped` for request-scoped services

**CORS**: Configured for `http://localhost:4200` in `AllowAngular` policy

**Soft deletes**: `CommunityPost` and `Comment` use `DeletedAt` with global query filters in `AppDbContext.OnModelCreating`

### Angular Frontend

**Routing**: Always use `[routerLink]` not `[href]` (causes full page reload - see Bug #4)

**Services**: 
- Core services are `providedIn: 'root'` singletons
- Feature services can be `providedIn: 'root'` or component-scoped

**SignalR usage pattern**:
```typescript
this.hubConnection = new signalR.HubConnectionBuilder()
  .withUrl(`${environment.apiBaseUrl}/pricehub`)
  .withAutomaticReconnect()
  .build();

await this.hubConnection.start();
this.hubConnection.on('ReceivePriceUpdate', (data) => { ... });
```

**Dark mode** (Admin only): 
- Toggle adds/removes `dark` class on `<html>` element
- Preference saved in localStorage
- All components use `dark:` Tailwind variants

### Database Patterns

**Indexes** defined in `AppDbContext.OnModelCreating`:
- Unique constraints: `Asset.Symbol`, `User.WalletAddress`
- Performance indexes on foreign keys and timestamp fields
- Filtered indexes for active records

**Relationships**:
- Watchlist → WatchlistItems (one-to-many)
- User → Posts/Comments/Reactions (one-to-many with cascade/restrict)
- UserFollow has self-referencing FK with check constraint preventing self-follows

## Integration Points

**External APIs**:
- CoinMarketCap: Asset data import, configured via `CoinMarketCap:ApiKey`
- Google OAuth2: User authentication
- Supabase: PostgreSQL database hosting

**SignalR flow**:
1. Frontend connects to hub and joins asset groups
2. `PriceDataCollector` background service calls `PriceHub.GetActiveAssetSymbols()`
3. Service fetches prices only for actively subscribed assets
4. Hub broadcasts updates to group members

**Key files for understanding data flow**:
- Backend: `Program.cs` (DI configuration), `AppDbContext.cs` (EF mappings)
- Frontend: `app.config.ts` (providers), `app.routes.ts` (lazy loading)

## Testing & Build

**Backend tests**: Not currently implemented (consider adding xUnit tests)

**Frontend tests**: Jasmine/Karma
- Standalone components use `imports` not `declarations` in test setup
- Modern async/await instead of deprecated `async()` wrapper
- See `admin-dashboard.component.spec.ts` for reference

**Build budgets**: Component CSS limited to 8KB - avoid importing Tailwind in component styles

## Common Gotchas

1. **Tailwind v4**: Do NOT upgrade - breaks Angular build (see CRITICAL Bug #1)
2. **RouterLink**: Always use `[routerLink]` not `href` for SPA navigation
3. **Background services**: Use `IServiceScopeFactory` to access scoped dependencies
4. **SignalR groups**: Must manually track active groups (see `PriceHub._activeGroups`)
5. **JWT expiration**: Default 60 minutes, no refresh token implemented
6. **Database connection**: appsettings.json contains production Supabase credentials (should be in secrets)

## Key Reference Files

- `MarketAnalysisBackend/Program.cs` - DI container, middleware pipeline, CORS
- `MarketAnalysisBackend/Data/AppDbContext.cs` - All EF Core configurations
- `MarketAnalysisBackend/Hubs/PriceHub.cs` - SignalR group management pattern
- `MarketAnalysisFrontend/src/app/core/services/api.service.ts` - SignalR client setup
- `MarketAnalysisAdmin/DARK_MODE_IMPLEMENTATION.md` - Complete dark mode guide
- `MarketAnalysisAdmin/BUG_FIXES_SUMMARY.md` - Known issues and resolutions
