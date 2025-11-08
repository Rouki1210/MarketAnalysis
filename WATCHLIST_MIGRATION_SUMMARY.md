# Watchlist Migration: LocalStorage → Database

## Tóm tắt thay đổi

Đã chuyển đổi watchlist từ localStorage sang database với phân chia theo từng user.

## Backend Changes

### 1. WatchlistController.cs
**Thêm 2 endpoints mới:**

- `GET /api/Watchlist/user/{userId}/default`
  - Lấy hoặc tạo watchlist mặc định cho user
  - Tự động tạo watchlist "My Watchlist" nếu chưa có

- `POST /api/Watchlist/user/{userId}/toggle/{assetId}`
  - Toggle asset trong watchlist (thêm nếu chưa có, xóa nếu đã có)
  - Trả về trạng thái `added: true/false` và watchlist đã cập nhật

### 2. IWatchlistService.cs
**Thêm interface methods:**
```csharp
Task<WatchlistDto> GetOrCreateDefaultWatchlistAsync(int userId);
Task<ToggleAssetResult> ToggleAssetInDefaultWatchlistAsync(int userId, int assetId);
```

**Thêm class:**
```csharp
public class ToggleAssetResult
{
    public bool Added { get; set; }
    public WatchlistDto Watchlist { get; set; }
}
```

### 3. WatchlistService.cs
**Implement 2 methods mới:**
- `GetOrCreateDefaultWatchlistAsync()`: Tạo watchlist "My Watchlist" nếu chưa có
- `ToggleAssetInDefaultWatchlistAsync()`: Toggle asset và trả về kết quả

## Frontend Changes

### 1. watchlist.model.ts
**Cập nhật models để match với backend DTOs:**
```typescript
export interface AssetDto {
  id: number;
  symbol: string;
  name: string;
}

export interface WatchlistDto {
  id: number;
  name: string;
  assets: AssetDto[];
}

export interface ToggleAssetResponse {
  success: boolean;
  added: boolean;
  watchlist: WatchlistDto;
}
```

### 2. watchlist.service.ts
**Thay đổi lớn:**
- ❌ Xóa: localStorage operations
- ✅ Thêm: HTTP calls đến backend API
- ✅ Thêm: `loadWatchlistFromDatabase()` - Load từ database khi user login
- ✅ Thay đổi: `toggleWatchlist()` - Gọi API thay vì update localStorage
- ✅ Thay đổi: `watchlistIds` từ `string[]` → `number[]` (asset IDs)

**Key changes:**
```typescript
// Old: localStorage
private loadWatchlistFromLocalStorage(): void { ... }
private saveWatchlistToLocalStorage(coinIds: string[]): void { ... }

// New: API calls
private loadWatchlistFromDatabase(): void {
  this.http.get<WatchlistResponse>(`${apiUrl}/user/${userId}/default`)
    .subscribe(...)
}

toggleWatchlist(coinId: number): boolean {
  this.http.post<ToggleAssetResponse>(`${apiUrl}/user/${userId}/toggle/${coinId}`, {})
    .subscribe(...)
}
```

### 3. auth.service.ts
**Cập nhật để load user info:**
- `setUser()`: Gọi `getUserInfo()` sau khi set token
- `checkAuthStatus()`: Load user info khi app khởi động
- `logout()`: Clear `currentUserSubject`

**Lý do:** WatchlistService cần `userId` từ `currentUserSubject` để gọi API

### 4. crypto-table.component.ts
**Cập nhật type:**
```typescript
// Old
watchlistIds: string[] = [];
toggleWatchlist(coinId: string, event: MouseEvent)
isInWatchlist(coinId: string): boolean

// New
watchlistIds: number[] = [];
toggleWatchlist(coinId: string, event: MouseEvent) {
  const assetId = Number(coinId);
  this.watchlistService.toggleWatchlist(assetId);
}
isInWatchlist(coinId: string): boolean {
  const assetId = Number(coinId);
  return this.watchlistIds.includes(assetId);
}
```

## Database Schema (Đã có sẵn)

```
Watchlist
├── Id (int, PK)
├── UserId (int, FK → User)
├── Name (string)
└── IsFavorite (bool)

WatchlistItems
├── Id (int, PK)
├── WatchlistId (int, FK → Watchlist)
├── AssetId (int, FK → Asset)
└── AddedAt (DateTime)
```

## Flow hoạt động

### 1. User Login
```
1. User login → AuthService.setUser()
2. AuthService.getUserInfo() → Load UserInfo vào currentUserSubject
3. WatchlistService effect() detect isAuthenticated = true
4. WatchlistService.loadWatchlistFromDatabase()
5. GET /api/Watchlist/user/{userId}/default
6. Backend tự động tạo "My Watchlist" nếu chưa có
7. Frontend nhận danh sách asset IDs và update watchlistIdsSubject
```

### 2. Toggle Watchlist
```
1. User click star icon → toggleWatchlist(assetId)
2. POST /api/Watchlist/user/{userId}/toggle/{assetId}
3. Backend check asset có trong watchlist không
   - Có: Remove asset
   - Không: Add asset
4. Backend trả về { added: bool, watchlist: WatchlistDto }
5. Frontend update watchlistIdsSubject với danh sách mới
6. UI tự động update (reactive)
```

### 3. User Logout
```
1. User logout → AuthService.logout()
2. Clear currentUserSubject
3. WatchlistService effect() detect isAuthenticated = false
4. Clear watchlistIdsSubject và watchlistCoinsSubject
```

## Testing Checklist

### Backend Testing
- [ ] GET /api/Watchlist/user/{userId}/default - Tạo watchlist mặc định
- [ ] POST /api/Watchlist/user/{userId}/toggle/{assetId} - Add asset
- [ ] POST /api/Watchlist/user/{userId}/toggle/{assetId} - Remove asset (toggle lần 2)
- [ ] Kiểm tra database: Watchlist và WatchlistItems được tạo đúng
- [ ] Test với nhiều user khác nhau - watchlist phân chia đúng

### Frontend Testing
- [ ] Login → Watchlist tự động load từ database
- [ ] Click star icon → Asset được add vào watchlist
- [ ] Click star icon lần 2 → Asset được remove
- [ ] Logout → Watchlist bị clear
- [ ] Login với user khác → Load watchlist của user đó
- [ ] Watchlist dropdown hiển thị đúng coins
- [ ] Real-time price updates trong watchlist dropdown

### Integration Testing
- [ ] User A add BTC → Chỉ user A thấy
- [ ] User B add ETH → Chỉ user B thấy
- [ ] User A logout/login lại → Vẫn thấy BTC
- [ ] Refresh page → Watchlist vẫn còn (load từ DB)

## Migration Notes

### Dữ liệu cũ trong localStorage
- Dữ liệu cũ trong localStorage sẽ KHÔNG được migrate tự động
- User cần add lại coins vào watchlist
- Có thể viết script migration nếu cần (đọc localStorage → POST vào API)

### Breaking Changes
- `watchlistIds` type changed: `string[]` → `number[]`
- `toggleWatchlist()` parameter: `string` → `number`
- `isInWatchlist()` parameter: `string` → `number`

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Watchlist/user/{userId}` | Get all watchlists của user |
| GET | `/api/Watchlist/user/{userId}/default` | Get/create default watchlist |
| GET | `/api/Watchlist/{watchlistId}` | Get watchlist by ID |
| POST | `/api/Watchlist/{userId}/create?name={name}` | Create new watchlist |
| POST | `/api/Watchlist/user/{userId}/toggle/{assetId}` | Toggle asset in default watchlist |
| POST | `/api/Watchlist/{watchlistId}/add/{assetId}` | Add asset to watchlist |
| DELETE | `/api/Watchlist/{watchlistId}/remove/{assetId}` | Remove asset from watchlist |

## Next Steps (Optional)

1. **Multiple Watchlists**: Cho phép user tạo nhiều watchlist
2. **Watchlist Sharing**: Chia sẻ watchlist với users khác
3. **Import/Export**: Export watchlist ra CSV/JSON
4. **Migration Script**: Migrate localStorage data sang database
5. **Offline Support**: Cache watchlist trong IndexedDB cho offline access

