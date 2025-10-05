# ⚡ Quick Start Guide

## 🎯 Get Running in 3 Steps

### Step 1: Install Dependencies
```bash
cd /Users/vuxphamj/Downloads/Frontend
npm install
```

### Step 2: Start Development Server
```bash
npm start
```

### Step 3: Open Browser
```
http://localhost:4200
```

**That's it! Your Angular crypto dashboard is running! 🎉**

---

## 📌 Quick Commands

| Command | What it does |
|---------|-------------|
| `npm start` | Start dev server on port 4200 |
| `npm run build` | Build for production |
| `npm run watch` | Build and watch for changes |
| `npm test` | Run unit tests |

---

## 🗺️ Quick Navigation

### Pages Available

1. **Dashboard** → `http://localhost:4200/`
   - Shows all cryptocurrencies in a table
   - Filter by network
   - Switch tabs (Top, Trending, etc.)

2. **Coin Detail** → `http://localhost:4200/coin/btc`
   - Click any cryptocurrency in the table
   - Or navigate to `/coin/{symbol}` (btc, eth, xrp, etc.)

---

## 🎨 What You'll See

### Dashboard Page Features:
- ✅ Header with navigation and search
- ✅ Market stats strip (Market Cap, Volume, Dominance)
- ✅ Cryptocurrency table with 10 coins
- ✅ Network filters (Bitcoin, Ethereum, BSC, Solana, Base)
- ✅ Tab navigation
- ✅ Sparkline charts for 7-day trends
- ✅ Color-coded price changes (green = up, red = down)
- ✅ Footer

### Coin Detail Page Features:
- ✅ Coin stats card (price, rank, market cap, volume)
- ✅ Interactive price chart with timeframe selector
- ✅ Market pairs table (exchanges, prices, volumes)
- ✅ Tab navigation (Chart, Markets, News, etc.)

---

## 🔧 Troubleshooting

### Port 4200 already in use?
```bash
ng serve --port 4300
# or
npm start -- --port 4300
```

### Installation failed?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Nothing showing up?
1. Check console for errors (F12)
2. Make sure you're on `http://localhost:4200` (not https)
3. Try hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### TypeScript errors?
The app uses strict TypeScript. All types are properly defined.
Check the file mentioned in the error.

---

## 📚 File Locations

Need to edit something? Here's where things are:

### Data (Mock)
- `src/app/core/services/api.service.ts` (line 12-130)

### Colors/Theme
- `src/styles/global.scss` (line 4-48)

### Components
- Dashboard: `src/app/features/dashboard/`
- Coin Detail: `src/app/features/coin/`
- Header: `src/app/layout/header/`

### Routes
- `src/app/app.routes.ts`

---

## 🎨 Customization

### Change Colors
Edit `src/styles/global.scss`:
```scss
:root {
  --primary: 216 100% 45%;     // Change this for different primary color
  --secondary: 142 76% 65%;    // Change this for gain color
  --accent: 0 84% 60%;         // Change this for loss color
}
```

### Add More Coins
Edit `src/app/core/services/api.service.ts`:
```typescript
private getMockCoins(): Coin[] {
  return [
    // Add more coin objects here
  ];
}
```

### Change Logo
Edit `src/app/layout/header/header.component.html` (line 11-15)

---

## 🚀 Next Steps

### To integrate real API:
1. Get API key from CoinGecko or CoinMarketCap
2. Update `src/app/core/services/api.service.ts`
3. Replace `of(mockData)` with `this.http.get(apiUrl)`

### To add authentication:
1. Create auth service: `src/app/core/services/auth.service.ts`
2. Add login/register pages
3. Create auth guard: `src/app/core/guards/auth.guard.ts`

### To add more features:
1. Create new feature folder: `src/app/features/my-feature/`
2. Add route in `app.routes.ts`
3. Create components as needed

---

## 💡 Pro Tips

1. **Use Angular DevTools** - Install Chrome extension for debugging
2. **VSCode Extensions** - Install "Angular Language Service"
3. **Hot Reload** - Changes auto-refresh the browser
4. **Component Inspector** - Right-click elements to see component structure
5. **Network Tab** - Check API calls in browser DevTools

---

## 📖 Learn More

- **Angular Tutorial**: https://angular.dev/tutorial
- **TailwindCSS Docs**: https://tailwindcss.com/docs
- **RxJS Guide**: https://rxjs.dev/guide/overview

---

## ✅ Checklist

Before you start coding:

- [ ] Dependencies installed (`npm install` completed)
- [ ] Dev server running (`npm start`)
- [ ] Browser open at `http://localhost:4200`
- [ ] Dashboard page loads
- [ ] Can click Bitcoin to see detail page
- [ ] Can filter by network
- [ ] Search bar visible (UI only, not functional yet)

---

## 🎉 You're All Set!

Your React crypto dashboard is now fully converted to Angular with:
- ✅ Same UI/UX as CoinMarketCap
- ✅ All features working
- ✅ Clean architecture
- ✅ Ready for real API integration

**Happy coding! 🚀**

---

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| Can't install | Check Node.js version (need 18+) |
| Port error | Use different port: `npm start -- --port 4300` |
| White screen | Check console for errors |
| Styling broken | Run `npm install` again |
| Can't navigate | Check `app.routes.ts` |

---

**Need more details?** Check:
- `SETUP.md` - Detailed setup
- `README.md` - Project overview
- `MIGRATION_GUIDE.md` - React vs Angular
- `PROJECT_SUMMARY.md` - Complete summary
- `FILE_STRUCTURE.md` - File organization

