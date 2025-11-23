using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Hubs;
using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.Alert;
using MarketAnalysisBackend.Services.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Controllers
{
    /// <summary>
    /// DEBUG CONTROLLER - Để test thủ công dễ dàng
    /// CHỈ DÙNG CHO DEVELOPMENT, XÓA TRƯỚC KHI DEPLOY PRODUCTION!
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize] // Uncomment trong production
    public class DebugAlertController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWatchlistPriceMonitorService _monitorService;
        private readonly IHubContext<AlertHub> _alertHubContext;
        private readonly ILogger<DebugController> _logger;

        public DebugAlertController(
            AppDbContext context,
            IWatchlistPriceMonitorService monitorService,
            IHubContext<AlertHub> alertHubContext,
            ILogger<DebugController> logger)
        {
            _context = context;
            _monitorService = monitorService;
            _alertHubContext = alertHubContext;
            _logger = logger;
        }

        /// <summary>
        /// 1. TRIGGER MANUAL PRICE CHECK
        /// Chạy service check giá ngay lập tức (không đợi 5 phút)
        /// </summary>
        [HttpPost("check-prices")]
        public async Task<IActionResult> TriggerPriceCheck()
        {
            try
            {
                _logger.LogInformation("🔍 Manual price check triggered");

                await _monitorService.MonitorAllWatchlistPricesAsync();

                return Ok(new
                {
                    success = true,
                    message = "✅ Price check completed",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during manual price check");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// 2. SEND TEST ALERT
        /// Gửi test alert đến user để kiểm tra SignalR
        /// </summary>
        [HttpPost("send-test-alert")]
        public async Task<IActionResult> SendTestAlert([FromQuery] int userId)
        {
            try
            {
                var notification = new
                {
                    id = 999,
                    assetSymbol = "TEST",
                    assetName = "Test Asset",
                    message = "🔔 This is a TEST alert",
                    targetPrice = 100m,
                    actualPrice = 105m,
                    alertType = "TEST",
                    triggeredAt = DateTime.UtcNow,
                    priceDifference = 5m
                };

                await _alertHubContext.Clients
                    .Group($"user_{userId}")
                    .SendAsync("ReceiveAlert", notification);

                _logger.LogInformation("📤 Test alert sent to user_{UserId}", userId);

                return Ok(new
                {
                    success = true,
                    message = $"✅ Test alert sent to user_{userId}",
                    notification
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// 3. SEED TEST DATA
        /// Tạo data test: users, assets, watchlists, prices
        /// </summary>
        [HttpPost("seed-data")]
        public async Task<IActionResult> SeedTestData()
        {
            try
            {
                // Clear existing data (optional)
                // await ClearAllDataAsync();

                // Users
                var users = new[]
                {
                    new User { Username = "testuser1", Email = "test1@example.com", CreatedAt = DateTime.UtcNow },
                    new User { Username = "testuser2", Email = "test2@example.com", CreatedAt = DateTime.UtcNow }
                };

                foreach (var user in users)
                {
                    if (!await _context.Users.AnyAsync(u => u.Username == user.Username))
                    {
                        _context.Users.Add(user);
                    }
                }
                await _context.SaveChangesAsync();

                // Assets
                var assets = new[]
                {
                    new Asset { Symbol = "BTC", Name = "Bitcoin" },
                    new Asset { Symbol = "ETH", Name = "Ethereum" },
                    new Asset { Symbol = "SOL", Name = "Solana" }
                };

                foreach (var asset in assets)
                {
                    if (!await _context.Assets.AnyAsync(a => a.Symbol == asset.Symbol))
                    {
                        _context.Assets.Add(asset);
                    }
                }
                await _context.SaveChangesAsync();

                // Get IDs
                var user1 = await _context.Users.FirstAsync(u => u.Username == "testuser1");
                var btc = await _context.Assets.FirstAsync(a => a.Symbol == "BTC");
                var eth = await _context.Assets.FirstAsync(a => a.Symbol == "ETH");
                var sol = await _context.Assets.FirstAsync(a => a.Symbol == "SOL");

                // Watchlists
                if (!await _context.Watchlists.AnyAsync(w => w.UserId == user1.Id && w.Name == "My Watchlist"))
                {
                    var watchlist = new Watchlist
                    {
                        UserId = user1.Id,
                        Name = "My Watchlist"
                    };
                    _context.Watchlists.Add(watchlist);
                    await _context.SaveChangesAsync();

                    // Add assets to watchlist
                    var watchlistAssets = new[]
                    {
                        new WatchlistItems { WatchlistId = watchlist.Id, AssetId = btc.Id, AddedAt = DateTime.UtcNow },
                        new WatchlistItems { WatchlistId = watchlist.Id, AssetId = eth.Id, AddedAt = DateTime.UtcNow }
                    };
                    _context.WatchlistItems.AddRange(watchlistAssets);
                    await _context.SaveChangesAsync();
                }

                // Price Caches
                var prices = new[]
                {
                    new { AssetId = btc.Id, CurrentPrice = 50000m, Price24hAgo = 47000m }, // BTC tăng 6.38%
                    new { AssetId = eth.Id, CurrentPrice = 2850m, Price24hAgo = 3000m },   // ETH giảm 5%
                    new { AssetId = sol.Id, CurrentPrice = 105m, Price24hAgo = 100m }      // SOL tăng 5%
                };

                foreach (var price in prices)
                {
                    var existing = await _context.PriceCaches.FirstOrDefaultAsync(p => p.AssetId == price.AssetId);
                    if (existing != null)
                    {
                        existing.CurrentPrice = price.CurrentPrice;
                        existing.Price24hAgo = price.Price24hAgo;
                    }
                    else
                    {
                        _context.PriceCaches.Add(new PriceCache
                        {
                            AssetId = price.AssetId,
                            CurrentPrice = price.CurrentPrice,
                            Price24hAgo = price.Price24hAgo
                        });
                    }
                }
                await _context.SaveChangesAsync();

                var summary = new
                {
                    users = await _context.Users.CountAsync(),
                    assets = await _context.Assets.CountAsync(),
                    watchlists = await _context.Watchlists.CountAsync(),
                    prices = await _context.PriceCaches.CountAsync()
                };

                return Ok(new
                {
                    success = true,
                    message = "✅ Test data seeded successfully",
                    summary
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// 4. UPDATE PRICE (SIMULATE PRICE CHANGE)
        /// Thay đổi giá để test alert trigger
        /// </summary>
        [HttpPost("update-price")]
        public async Task<IActionResult> UpdatePrice(
            [FromQuery] string symbol,
            [FromQuery] decimal newPrice)
        {
            try
            {
                var asset = await _context.Assets.FirstOrDefaultAsync(a => a.Symbol == symbol);
                if (asset == null)
                {
                    return NotFound(new { error = $"Asset {symbol} not found" });
                }

                var priceCache = await _context.PriceCaches.FirstOrDefaultAsync(p => p.AssetId == asset.Id);
                if (priceCache == null)
                {
                    priceCache = new PriceCache
                    {
                        AssetId = asset.Id,
                        Price24hAgo = newPrice * 0.95m // Default: 5% lower
                    };
                    _context.PriceCaches.Add(priceCache);
                }

                var oldPrice = priceCache.CurrentPrice;
                priceCache.CurrentPrice = newPrice;

                await _context.SaveChangesAsync();

                var change = oldPrice > 0
                    ? ((newPrice - oldPrice) / oldPrice) * 100
                    : 0;

                return Ok(new
                {
                    success = true,
                    message = $"✅ {symbol} price updated",
                    symbol,
                    oldPrice,
                    newPrice,
                    changePercent = $"{change:+0.00;-0.00}%"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// 5. GET SERVICE STATUS
        /// Xem trạng thái service, database, alerts
        /// </summary>
        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            try
            {
                var users = await _context.Users.CountAsync();
                var assets = await _context.Assets.CountAsync();
                var watchlists = await _context.Watchlists.CountAsync();
                var prices = await _context.PriceCaches.CountAsync();
                var alerts = await _context.UserAlertHistories
                    .Where(h => h.TriggeredAt >= DateTime.UtcNow.AddDays(-7))
                    .CountAsync();

                var recentAlerts = await _context.UserAlertHistories
                    .OrderByDescending(h => h.TriggeredAt)
                    .Take(5)
                    .Select(h => new
                    {
                        h.AssetSymbol,
                        h.TriggeredAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    status = "running",
                    timestamp = DateTime.UtcNow,
                    database = new
                    {
                        users,
                        assets,
                        watchlists,
                        prices
                    },
                    alerts = new
                    {
                        last7Days = alerts,
                        recent = recentAlerts
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// 6. GET DETAILED INFO
        /// Xem chi tiết users, watchlists, prices
        /// </summary>
        [HttpGet("info")]
        public async Task<IActionResult> GetDetailedInfo()
        {
            try
            {
                var users = await _context.Users
                    .Select(u => new
                    {
                        u.Id,
                        u.Username,
                        u.Email
                    })
                    .ToListAsync();

                var watchlists = await _context.Watchlists
                    .Include(w => w.WatchlistItems)
                        .ThenInclude(wa => wa.Asset)
                    .Select(w => new
                    {
                        w.Id,
                        w.UserId,
                        w.Name,
                        Assets = w.WatchlistItems.Select(wa => new
                        {
                            wa.Asset.Id,
                            wa.Asset.Symbol,
                            wa.Asset.Name
                        }).ToList()
                    })
                    .ToListAsync();

                // Replace the problematic line in GetDetailedInfo() with a correct null check and calculation
                var prices = await _context.PriceCaches
                    .Include(p => p.Asset)
                    .Select(p => new
                    {
                        Symbol = p.Asset.Symbol,
                        p.CurrentPrice,
                        p.Price24hAgo,
                        ChangePercent = p.Price24hAgo != null && p.Price24hAgo > 0
                            ? ((p.CurrentPrice - p.Price24hAgo) / p.Price24hAgo) * 100
                            : 0,
                    })
                    .ToListAsync();

                return Ok(new
                {
                    users,
                    watchlists,
                    prices
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// 7. CLEAR ALERTS
        /// Xóa tất cả alerts để test lại
        /// </summary>
        [HttpDelete("clear-alerts")]
        public async Task<IActionResult> ClearAlerts()
        {
            try
            {
                var count = await _context.UserAlertHistories.CountAsync();
                _context.UserAlertHistories.RemoveRange(_context.UserAlertHistories);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = $"✅ Cleared {count} alerts"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// 8. SIMULATE PRICE SPIKE
        /// Giả lập giá tăng/giảm đột ngột để test alert
        /// </summary>
        [HttpPost("simulate-spike")]
        public async Task<IActionResult> SimulatePriceSpike(
            [FromQuery] string symbol,
            [FromQuery] decimal percentChange)
        {
            try
            {
                var asset = await _context.Assets.FirstOrDefaultAsync(a => a.Symbol == symbol);
                if (asset == null)
                {
                    return NotFound(new { error = $"Asset {symbol} not found" });
                }

                var priceCache = await _context.PriceCaches.FirstOrDefaultAsync(p => p.AssetId == asset.Id);
                if (priceCache == null)
                {
                    return NotFound(new { error = $"Price cache for {symbol} not found" });
                }

                var oldPrice = priceCache.CurrentPrice;
                var newPrice = oldPrice * (1 + percentChange / 100);

                priceCache.CurrentPrice = newPrice;
                priceCache.LastUpdate = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Trigger price check
                await _monitorService.MonitorAllWatchlistPricesAsync();

                // Check if alert was created
                var latestAlert = await _context.UserAlertHistories
                    .Where(h => h.AssetId == asset.Id)
                    .OrderByDescending(h => h.TriggeredAt)
                    .FirstOrDefaultAsync();

                return Ok(new
                {
                    success = true,
                    message = $"✅ Simulated {percentChange:+0.00;-0.00}% spike for {symbol}",
                    symbol,
                    oldPrice,
                    newPrice,
                    percentChange,
                    alertCreated = latestAlert != null && latestAlert.TriggeredAt > DateTime.UtcNow.AddMinutes(-1),
                    latestAlert = latestAlert != null ? new
                    {
                        latestAlert.TriggeredAt
                    } : null
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// 9. TEST SCENARIO: Giá Tăng Mạnh
        /// </summary>
        [HttpPost("scenario/price-increase")]
        public async Task<IActionResult> TestScenarioPriceIncrease()
        {
            try
            {
                // Set BTC tăng 6%
                var btc = await _context.Assets.FirstOrDefaultAsync(a => a.Symbol == "BTC");
                if (btc == null) return NotFound("BTC not found. Run /seed-data first");

                var priceCache = await _context.PriceCaches.FirstOrDefaultAsync(p => p.AssetId == btc.Id);
                if (priceCache == null)
                {
                    priceCache = new PriceCache { AssetId = btc.Id, Price24hAgo = 47000m };
                    _context.PriceCaches.Add(priceCache);
                }

                priceCache.CurrentPrice = 52600m; // Tăng từ 47000 → 52600 (+11.9%)
                await _context.SaveChangesAsync();

                // Trigger check
                await _monitorService.MonitorAllWatchlistPricesAsync();

                var alert = await _context.UserAlertHistories
                    .Where(h => h.AssetId == btc.Id)
                    .OrderByDescending(h => h.TriggeredAt)
                    .FirstOrDefaultAsync();

                return Ok(new
                {
                    success = true,
                    scenario = "Price Increase",
                    description = "BTC tăng từ $47,000 → $52,600 (+11.9%)",
                    alertCreated = alert != null && alert.TriggeredAt > DateTime.UtcNow.AddMinutes(-1),
                    alert = alert != null ? new
                    {
                        alert.TargetPrice,
                        alert.ActualPrice,
                        alert.TriggeredAt
                    } : null
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// 10. QUICK TEST - All in one
        /// Seed data + Simulate spike + Check alert
        /// </summary>
        [HttpPost("quick-test")]
        public async Task<IActionResult> QuickTest()
        {
            try
            {
                var results = new List<string>();

                // 1. Seed data
                results.Add("1️⃣ Seeding data...");
                await SeedTestData();
                results.Add("✅ Data seeded");

                // 2. Simulate spike
                results.Add("2️⃣ Simulating BTC price spike...");
                var btc = await _context.Assets.FirstOrDefaultAsync(a => a.Symbol == "BTC");
                if (btc != null)
                {
                    var priceCache = await _context.PriceCaches.FirstOrDefaultAsync(p => p.AssetId == btc.Id);
                    if (priceCache != null)
                    {
                        priceCache.CurrentPrice = 52600m;
                        await _context.SaveChangesAsync();
                        results.Add("✅ BTC price set to $52,600");
                    }
                }

                // 3. Trigger check
                results.Add("3️⃣ Triggering price check...");
                await _monitorService.MonitorAllWatchlistPricesAsync();
                results.Add("✅ Price check completed");

                // 4. Check alerts
                var alertsCount = await _context.UserAlertHistories
                    .Where(h => h.TriggeredAt > DateTime.UtcNow.AddMinutes(-1))
                    .CountAsync();
                results.Add($"4️⃣ Alerts created: {alertsCount}");

                return Ok(new
                {
                    success = true,
                    message = "✅ Quick test completed",
                    steps = results,
                    alertsCreated = alertsCount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}