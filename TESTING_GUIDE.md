# Watchlist Testing Guide

## Prerequisites

### 1. Start Backend
```bash
cd MarketAnalysisBackend
dotnet run
```
Backend should be running on `https://localhost:7175`

### 2. Start Frontend
```bash
cd MarketAnalysisFrontend
npm start
# or
ng serve
```
Frontend should be running on `http://localhost:4200`

### 3. Database
Ensure PostgreSQL is running and database is migrated with latest schema.

## Test Scenarios

### Scenario 1: First Time User - Auto Create Watchlist

**Steps:**
1. Open browser → `http://localhost:4200`
2. Click "Login" button
3. Register a new account (e.g., `test1@example.com`)
4. After login, open browser DevTools → Network tab
5. Click star icon on any coin (e.g., Bitcoin)

**Expected Results:**
- ✅ Network tab shows POST request to `/api/Watchlist/user/{userId}/toggle/{assetId}`
- ✅ Response: `{ success: true, added: true, watchlist: {...} }`
- ✅ Star icon turns yellow (filled)
- ✅ Coin appears in watchlist dropdown (header)

**Database Check:**
```sql
-- Check if "My Watchlist" was created
SELECT * FROM "Watchlist" WHERE "UserId" = 1;

-- Check if asset was added
SELECT * FROM "WatchlistItems" WHERE "WatchlistId" = 1;
```

---

### Scenario 2: Toggle Watchlist (Add/Remove)

**Steps:**
1. Login as existing user
2. Click star icon on Bitcoin → Should add
3. Click star icon on Bitcoin again → Should remove
4. Click star icon on Ethereum → Should add
5. Check watchlist dropdown

**Expected Results:**
- ✅ First click: Star turns yellow, Bitcoin added
- ✅ Second click: Star turns gray, Bitcoin removed
- ✅ Third click: Star turns yellow, Ethereum added
- ✅ Watchlist dropdown shows only Ethereum

**Network Requests:**
```
POST /api/Watchlist/user/1/toggle/1  → { added: true }
POST /api/Watchlist/user/1/toggle/1  → { added: false }
POST /api/Watchlist/user/1/toggle/2  → { added: true }
```

---

### Scenario 3: Watchlist Persistence

**Steps:**
1. Login as user
2. Add 3 coins to watchlist (BTC, ETH, SOL)
3. Refresh page (F5)
4. Check watchlist dropdown

**Expected Results:**
- ✅ After refresh, watchlist still shows 3 coins
- ✅ Star icons are still yellow for those 3 coins
- ✅ Network tab shows GET request to `/api/Watchlist/user/{userId}/default`

**Console Logs:**
```
✅ User info loaded on startup: { id: 1, email: "test1@example.com", ... }
✅ Watchlist loaded from database
```

---

### Scenario 4: Multi-User Isolation

**Steps:**
1. Login as User A (`test1@example.com`)
2. Add Bitcoin and Ethereum to watchlist
3. Logout
4. Login as User B (`test2@example.com`)
5. Check watchlist dropdown
6. Add Solana to watchlist
7. Logout
8. Login back as User A
9. Check watchlist dropdown

**Expected Results:**
- ✅ User A sees: Bitcoin, Ethereum
- ✅ User B sees: Solana (empty at first)
- ✅ After User A logs back in: Still sees Bitcoin, Ethereum
- ✅ User B's Solana is NOT visible to User A

**Database Check:**
```sql
-- User A's watchlist
SELECT w.*, wi.*, a."Symbol" 
FROM "Watchlist" w
JOIN "WatchlistItems" wi ON w."Id" = wi."WatchlistId"
JOIN "Asset" a ON wi."AssetId" = a."Id"
WHERE w."UserId" = 1;

-- User B's watchlist
SELECT w.*, wi.*, a."Symbol" 
FROM "Watchlist" w
JOIN "WatchlistItems" wi ON w."Id" = wi."WatchlistId"
JOIN "Asset" a ON wi."AssetId" = a."Id"
WHERE w."UserId" = 2;
```

---

### Scenario 5: Logout Clears Watchlist UI

**Steps:**
1. Login as user
2. Add coins to watchlist
3. Verify watchlist dropdown shows coins
4. Logout
5. Check watchlist dropdown

**Expected Results:**
- ✅ After logout, watchlist dropdown is empty
- ✅ Star icons are all gray (not filled)
- ✅ Console shows: `Watchlist cleared on logout`

---

### Scenario 6: Unauthenticated User

**Steps:**
1. Logout (or open incognito window)
2. Go to dashboard
3. Click star icon on any coin

**Expected Results:**
- ✅ Auth modal opens (login/signup)
- ✅ No API request is made
- ✅ Star icon remains gray

---

### Scenario 7: Real-time Price Updates in Watchlist

**Steps:**
1. Login as user
2. Add Bitcoin to watchlist
3. Open watchlist dropdown
4. Wait for price updates (SignalR)

**Expected Results:**
- ✅ Watchlist dropdown shows Bitcoin with current price
- ✅ Price updates in real-time (every few seconds)
- ✅ 24h change updates
- ✅ Sparkline chart updates

---

### Scenario 8: Navigate to Coin from Watchlist

**Steps:**
1. Login as user
2. Add Bitcoin to watchlist
3. Open watchlist dropdown
4. Click on Bitcoin in the dropdown

**Expected Results:**
- ✅ Navigates to `/coin/btc` page
- ✅ Watchlist dropdown closes
- ✅ Coin detail page loads

---

## API Testing (Postman/cURL)

### 1. Get or Create Default Watchlist
```bash
curl -X GET "https://localhost:7175/api/Watchlist/user/1/default" \
  -H "accept: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My Watchlist",
    "assets": []
  }
}
```

### 2. Toggle Asset (Add)
```bash
curl -X POST "https://localhost:7175/api/Watchlist/user/1/toggle/1" \
  -H "accept: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "added": true,
  "watchlist": {
    "id": 1,
    "name": "My Watchlist",
    "assets": [
      {
        "id": 1,
        "symbol": "BTC",
        "name": "Bitcoin"
      }
    ]
  }
}
```

### 3. Toggle Asset (Remove)
```bash
curl -X POST "https://localhost:7175/api/Watchlist/user/1/toggle/1" \
  -H "accept: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "added": false,
  "watchlist": {
    "id": 1,
    "name": "My Watchlist",
    "assets": []
  }
}
```

---

## Common Issues & Debugging

### Issue 1: "Cannot toggle watchlist: User ID not available"

**Cause:** `currentUserSubject` is null

**Fix:**
- Check if `getUserInfo()` is called after login
- Check browser console for user info logs
- Verify token is stored in localStorage

**Debug:**
```javascript
// In browser console
localStorage.getItem('token')
// Should return JWT token
```

### Issue 2: Star icon doesn't change color

**Cause:** Type mismatch between `coin.id` and `watchlistIds`

**Fix:**
- Ensure `coin.id` is converted to number
- Check `isInWatchlist()` method

**Debug:**
```typescript
// In crypto-table.component.ts
console.log('Coin ID type:', typeof coin.id);
console.log('Watchlist IDs:', this.watchlistIds);
```

### Issue 3: Watchlist not loading on page refresh

**Cause:** `getUserInfo()` not called on app startup

**Fix:**
- Check `checkAuthStatus()` in AuthService
- Ensure it calls `getUserInfo()` when token exists

**Debug:**
```javascript
// In browser console
// Check if user info is loaded
console.log(authService.currentUserSubject.value);
```

### Issue 4: CORS error

**Cause:** Backend CORS not configured for frontend URL

**Fix:**
- Check `Program.cs` CORS configuration
- Ensure `http://localhost:4200` is allowed

### Issue 5: 404 on API endpoints

**Cause:** Backend not running or wrong URL

**Fix:**
- Verify backend is running on `https://localhost:7175`
- Check `watchlist.service.ts` apiUrl constant

---

## Performance Testing

### Load Test: Multiple Users
1. Create 10 users
2. Each user adds 20 coins to watchlist
3. Check database query performance
4. Monitor API response times

**Expected:**
- ✅ API response < 200ms
- ✅ No N+1 query issues
- ✅ Database indexes working

### Stress Test: Rapid Toggles
1. Login as user
2. Rapidly click star icon 10 times
3. Check if all requests complete
4. Verify final state is correct

**Expected:**
- ✅ All requests complete successfully
- ✅ Final state matches last request
- ✅ No race conditions

---

## Checklist

### Backend
- [ ] Build succeeds without errors
- [ ] Database migrations applied
- [ ] Backend running on https://localhost:7175
- [ ] Swagger UI accessible at /swagger

### Frontend
- [ ] Build succeeds without errors
- [ ] Frontend running on http://localhost:4200
- [ ] No console errors on page load

### Functionality
- [ ] User can login/logout
- [ ] Star icon toggles watchlist
- [ ] Watchlist persists after refresh
- [ ] Multi-user isolation works
- [ ] Watchlist dropdown shows correct coins
- [ ] Real-time price updates work
- [ ] Navigate to coin from watchlist works

### Database
- [ ] Watchlist table has data
- [ ] WatchlistItems table has data
- [ ] Data is correctly associated with users
- [ ] No orphaned records

---

## Success Criteria

✅ **All test scenarios pass**
✅ **No console errors**
✅ **No network errors**
✅ **Database data is correct**
✅ **Multi-user isolation confirmed**
✅ **Performance is acceptable**

---

## Next Steps After Testing

1. **Fix any bugs found during testing**
2. **Add error handling for edge cases**
3. **Add loading states for API calls**
4. **Add success/error notifications**
5. **Consider adding unit tests**
6. **Consider adding E2E tests with Cypress/Playwright**

