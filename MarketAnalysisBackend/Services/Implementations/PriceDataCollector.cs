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

                    var url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?convert=USD";
                    var response = await client.GetStringAsync(url, stoppingToken);

                    var jsonDoc = JsonDocument.Parse(response);
                    var dataArray = jsonDoc.RootElement.GetProperty("data").EnumerateArray();

                    foreach (var coin in dataArray)
                    {
                        var symbol = coin.GetProperty("symbol").GetString();
                        var matchAsset = assets.FirstOrDefault(a => a.Symbol.Equals(symbol, StringComparison.OrdinalIgnoreCase));
                        if (matchAsset == null) continue;

                        var quote = coin.GetProperty("quote").GetProperty("USD");
                        _logger.LogInformation(symbol, quote);
                        var pricePoint = new PricePoint
                        {
                            AssetId = matchAsset.Id,
                            TimestampUtc = DateTime.UtcNow,
                            Open = quote.GetProperty("price").GetDecimal(),
                            High = quote.GetProperty("price").GetDecimal(),
                            Low = quote.GetProperty("price").GetDecimal(),
                            Close = quote.GetProperty("price").GetDecimal(),
                            Volume = quote.GetProperty("volume_24h").GetDecimal(),
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

                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }
}
