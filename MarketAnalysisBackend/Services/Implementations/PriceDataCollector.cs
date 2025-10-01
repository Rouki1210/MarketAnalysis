using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Repositories.Interfaces;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text.Json;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class PriceDataCollector : BackgroundService
    {
        private readonly ILogger<PriceDataCollector> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly string _apiKey;

        public PriceDataCollector(
            ILogger<PriceDataCollector> logger,
            IHttpClientFactory httpClientFactory,
            IServiceScopeFactory serviceScopeFactory,
            IConfiguration config)
        {
            _logger = logger;
            _httpClientFactory = httpClientFactory;
            _serviceScopeFactory = serviceScopeFactory;
            _apiKey = config["CoinMarketCap:ApiKey"] ?? throw new Exception("API key missing");
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
                    var assets = await assetRepo.GetAllAsync();
                    if (!assets.Any())
                    {
                        _logger.LogWarning("No assets in DB");
                        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                        continue;
                    }

                    var client = _httpClientFactory.CreateClient();
                    client.DefaultRequestHeaders.Add("X-CMC_PRO_API_KEY", _apiKey);
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    // Fetch latest listings
                    var url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100";
                    var response = await client.GetStringAsync(url, stoppingToken);
                    var jsonDoc = JsonDocument.Parse(response);
                    var dataArray = jsonDoc.RootElement.GetProperty("data").EnumerateArray();

                    // Fetch OHLC data for specific symbols
                    var symbols = string.Join(",", assets.Select(a => a.Symbol));
                    var urlOhlc = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/ohlcv/latest?symbol={symbols}";
                    var responseOhlc = await client.GetStringAsync(urlOhlc, stoppingToken);
                    var jsonDocOhlc = JsonDocument.Parse(responseOhlc);
                    var ohlcData = jsonDocOhlc.RootElement.GetProperty("data");


                    foreach (var coin in dataArray)
                    {
                        var symbol = coin.GetProperty("symbol").GetString();
                        var matchAsset = assets.FirstOrDefault(a => a.Symbol.Equals(symbol, StringComparison.OrdinalIgnoreCase));
                        if (matchAsset == null) continue;

                        var quote = coin.GetProperty("quote").GetProperty("USD");

                        if (!ohlcData.TryGetProperty(symbol, out var ohlcEntry)) continue;
                        var usdOhlc = ohlcEntry.GetProperty("quotes")[0].GetProperty("quote").GetProperty("USD");

                        var pricePoint = new PricePoint
                        {
                            AssetId = matchAsset.Id,
                            TimestampUtc = DateTime.UtcNow,
                            Price = quote.GetProperty("price").GetDecimal(),

                            //using OHLC data from OHLC endpoint
                            Open = usdOhlc.GetProperty("open").GetDecimal(),
                            High = quote.GetProperty("high").GetDecimal(),
                            Low = quote.GetProperty("low").GetDecimal(),
                            Close = quote.GetProperty("close").GetDecimal(),

                            //using quotes endpoint
                            Volume = quote.GetProperty("volume_24h").GetDecimal(),
                            MarketCap = quote.GetProperty("market_cap").GetDecimal(),
                            PercentChange1h = quote.GetProperty("percent_change_1h").GetDecimal(),
                            PercentChange24h = quote.GetProperty("percent_change_24h").GetDecimal(),
                            PercentChange7d = quote.GetProperty("percent_change_7d").GetDecimal(),
                            Source = "CoinMarketCap"
                        };

                        await priceRepo.AddAsync(pricePoint);
                    }

                    await priceRepo.SaveChangesAsync();
                    _logger.LogInformation("CMC data updated at {time}", DateTime.UtcNow);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error collecting data from CoinMarketCap");
                }

                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}
