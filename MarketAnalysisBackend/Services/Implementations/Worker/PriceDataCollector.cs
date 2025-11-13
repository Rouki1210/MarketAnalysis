using MarketAnalysisBackend.Hubs;
using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Repositories.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text.Json;

namespace MarketAnalysisBackend.Services.Implementations.Worker
{
    public class PriceDataCollector : BackgroundService
    {
        private readonly ILogger<PriceDataCollector> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly string _apiKey;
        private readonly IHubContext<PriceHub> _hubContext;

        public PriceDataCollector(
            ILogger<PriceDataCollector> logger,
            IHttpClientFactory httpClientFactory,
            IServiceScopeFactory serviceScopeFactory,
            IConfiguration config,
            IHubContext<PriceHub> hubContext)
        {
            _logger = logger;
            _httpClientFactory = httpClientFactory;
            _serviceScopeFactory = serviceScopeFactory;
            _apiKey = config["CoinMarketCap:ApiKey"] ?? throw new Exception("API key missing");
            _hubContext = hubContext;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("PriceDataCollector started");

            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var assetRepo = scope.ServiceProvider.GetRequiredService<IGenericRepository<Asset>>();
                var priceRepo = scope.ServiceProvider.GetRequiredService<IPriceRepository>();

                try
                {
                    var activeSymbols = PriceHub.GetActiveAssetSymbols();
                    if (!activeSymbols.Any())
                    {
                        await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
                        continue;
                    }

                    var assets = await assetRepo.GetAllAsync();
                    var activeAssets = assets.Where(a => activeSymbols.Contains(a.Symbol, StringComparer.OrdinalIgnoreCase)).ToList();

                    if (!activeAssets.Any())
                    {
                        _logger.LogWarning("No active assets found in DB matching current symbols");
                        await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
                        continue;
                    }

                    var client = _httpClientFactory.CreateClient();
                    client.DefaultRequestHeaders.Add("X-CMC_PRO_API_KEY", _apiKey);
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Build symbols string for batch request
                    var symbols = string.Join(",", activeAssets.Select(a => a.Symbol));

                    // Fetch latest quotes for active assets only
                    var quotesUrl = $"https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol={symbols}";
                    var quotesResponse = await client.GetStringAsync(quotesUrl, stoppingToken);
                    var quotesDoc = JsonDocument.Parse(quotesResponse);
                    var quotesData = quotesDoc.RootElement.GetProperty("data");

                    // Fetch OHLC data for active assets in one batch request
                    var ohlcUrl = $"https://pro-api.coinmarketcap.com/v2/cryptocurrency/ohlcv/latest?symbol={symbols}";
                    var ohlcResponse = await client.GetStringAsync(ohlcUrl, stoppingToken);
                    var ohlcDoc = JsonDocument.Parse(ohlcResponse);
                    var ohlcData = ohlcDoc.RootElement.GetProperty("data");

                    foreach (var asset in activeAssets)
                    {
                        try
                        {
                            // Check if data exists for this symbol
                            if (!quotesData.TryGetProperty(asset.Symbol, out var coinDataArray) ||
                                coinDataArray.ValueKind == JsonValueKind.Null ||
                                coinDataArray.GetArrayLength() == 0)
                            {
                                _logger.LogWarning("No quotes data found for symbol: {Symbol}", asset.Symbol);
                                continue;
                            }

                            if (!ohlcData.TryGetProperty(asset.Symbol, out var ohlcEntry) ||
                                ohlcEntry.ValueKind == JsonValueKind.Null ||
                                ohlcEntry.GetArrayLength() == 0)
                            {
                                _logger.LogWarning("No OHLC data found for symbol: {Symbol}", asset.Symbol);
                                continue;
                            }

                            // Get the first item from the array (latest data)
                            var coinData = coinDataArray[0];

                            // Check for required properties
                            if (!coinData.TryGetProperty("quote", out var quoteElement) ||
                                quoteElement.ValueKind == JsonValueKind.Null ||
                                !quoteElement.TryGetProperty("USD", out var quote) ||
                                quote.ValueKind == JsonValueKind.Null)
                            {
                                _logger.LogWarning("Missing quote data for symbol: {Symbol}", asset.Symbol);
                                continue;
                            }

                            // Get OHLC data
                            var ohlcItem = ohlcEntry[0];
                            if (!ohlcItem.TryGetProperty("quote", out var ohlcQuoteElement) ||
                                ohlcQuoteElement.ValueKind == JsonValueKind.Null ||
                                !ohlcQuoteElement.TryGetProperty("USD", out var ohlcQuotes) ||
                                ohlcQuotes.ValueKind == JsonValueKind.Null)
                            {
                                _logger.LogWarning("Missing OHLC quote data for symbol: {Symbol}", asset.Symbol);
                                continue;
                            }

                            // Get timestamp
                            DateTime timestamp = DateTime.UtcNow;
                            if (ohlcItem.TryGetProperty("time_close", out var timeClose) &&
                                timeClose.ValueKind != JsonValueKind.Null)
                            {
                                timestamp = timeClose.GetDateTime();
                            }

                            // Helper method to safely get decimal values
                            decimal GetDecimalOrDefault(JsonElement element, string propertyName, decimal defaultValue = 0)
                            {
                                if (element.TryGetProperty(propertyName, out var prop) &&
                                    prop.ValueKind != JsonValueKind.Null)
                                {
                                    return prop.GetDecimal();
                                }
                                return defaultValue;
                            }

                            var pricePoint = new PricePoint
                            {
                                AssetId = asset.Id,
                                TimestampUtc = timestamp,
                                Price = GetDecimalOrDefault(quote, "price"),
                                CirculatingSupply = GetDecimalOrDefault(coinData, "circulating_supply"),

                                // Using OHLC data from OHLC endpoint
                                Open = GetDecimalOrDefault(ohlcQuotes, "open"),
                                High = GetDecimalOrDefault(ohlcQuotes, "high"),
                                Low = GetDecimalOrDefault(ohlcQuotes, "low"),
                                Close = GetDecimalOrDefault(ohlcQuotes, "close"),

                                // Volume and market data
                                Volume = GetDecimalOrDefault(ohlcQuotes, "volume"),
                                MarketCap = GetDecimalOrDefault(quote, "market_cap"),
                                PercentChange1h = GetDecimalOrDefault(quote, "percent_change_1h"),
                                PercentChange24h = GetDecimalOrDefault(quote, "percent_change_24h"),
                                PercentChange7d = GetDecimalOrDefault(quote, "percent_change_7d"),
                                Source = "CoinMarketCap"
                            };

                            await priceRepo.AddAsync(pricePoint);

                            var message = new
                            {
                                type = "price_update",
                                data = new
                                {
                                    asset = asset.Symbol,
                                    timestamp = timestamp,
                                    price = pricePoint.Price,
                                    open = pricePoint.Open,
                                    high = pricePoint.High,
                                    low = pricePoint.Low,
                                    close = pricePoint.Close,
                                    change1h = pricePoint.PercentChange1h,
                                    change24h = pricePoint.PercentChange24h,
                                    change7d = pricePoint.PercentChange7d,
                                    marketCap = pricePoint.MarketCap,
                                    volume = pricePoint.Volume,
                                    supply = pricePoint.CirculatingSupply,
                                }
                            };

                            await _hubContext.Clients.Group(asset.Symbol).SendAsync("ReceiveMessage", message, stoppingToken);

                            _logger.LogInformation("Updated price data for {Symbol}", asset.Symbol);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error processing data for symbol: {Symbol}", asset.Symbol);
                        }
                    }

                    await priceRepo.SaveChangesAsync();
                    _logger.LogInformation("CMC data updated for {Count} assets at {Time}", activeAssets.Count, DateTime.UtcNow);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error collecting data from CoinMarketCap");
                }

                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }
    }
}