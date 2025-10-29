using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Hubs;
using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Headers;
using System.Text.Json;
using static System.Net.WebRequestMethods;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class GlobalMetricService : BackgroundService
    {
        private readonly ILogger<GlobalMetricService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly string _apiKey;
        private readonly IHubContext<GlobalMetric> _hubContext;

        public GlobalMetricService(
            ILogger<GlobalMetricService> logger,
            IHttpClientFactory httpClientFactory,
            IServiceScopeFactory serviceScopeFactory,
            IHubContext<GlobalMetric> hubContext,
            IConfiguration config)
        {
            _logger = logger;
            _httpClientFactory = httpClientFactory;
            _serviceScopeFactory = serviceScopeFactory;
            _hubContext = hubContext;
            _apiKey = config["CoinMarketCap:ApiKey"] ?? throw new Exception("API key missing");
        }

        public async Task<Global_metric> FetchAndSaveMetricsAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<IGenericRepository<Global_metric>>();
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("X-CMC_PRO_API_KEY", _apiKey);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            // --- Global Market Metrics ---
            var globalUrl = "https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest";
            var response = await client.GetStringAsync(globalUrl, stoppingToken);
            var jsonDoc = JsonDocument.Parse(response);
            var data = jsonDoc.RootElement.GetProperty("data");

            var totalMarketCap = data.GetProperty("quote").GetProperty("USD").GetProperty("total_market_cap").GetDecimal();
            var totalMarketCapChange24h = data.GetProperty("quote").GetProperty("USD").GetProperty("total_market_cap_yesterday_percentage_change").GetDecimal();
            var totalVolume24h = data.GetProperty("quote").GetProperty("USD").GetProperty("total_volume_24h").GetDecimal();
            var totalVolume24hChange24h = data.GetProperty("quote").GetProperty("USD").GetProperty("total_volume_24h_yesterday_percentage_change").GetDecimal();
            var btcDominance = data.GetProperty("btc_dominance").GetDecimal();
            var ethDominance = data.GetProperty("eth_dominance").GetDecimal();
            var btcDominancePercentage = data.GetProperty("btc_dominance_24h_percentage_change").GetDecimal();
            var ethDominancePercentage = data.GetProperty("eth_dominance_24h_percentage_change").GetDecimal();

            // --- Fear & Greed Index ---
            var fngUrl = "https://pro-api.coinmarketcap.com/v3/fear-and-greed/latest";
            var fngResponse = await client.GetStringAsync(fngUrl, stoppingToken);
            var fngJson = JsonDocument.Parse(fngResponse);
            var fngData = fngJson.RootElement.GetProperty("data");
            var fngText = fngData.GetProperty("value_classification").GetString() ?? "Neutral";
            var fngValue = fngData.GetProperty("value");


            // --- Custom Altcoin Season Score ---
            int altcoinScore = (int)(100 - btcDominance);

            var globalMetric = new Global_metric
            {
                Total_market_cap_usd = totalMarketCap,
                Total_market_cap_percent_change_24h = totalMarketCapChange24h,
                Total_volume_24h = totalVolume24h,
                Total_volume_24h_percent_change_24h = totalVolume24hChange24h,
                Cmc_20 = 0,
                fear_and_greed_index = fngValue.ToString(),
                fear_and_greed_text = fngText,
                Bitcoin_dominance_percentage = btcDominancePercentage,
                Ethereum_dominance_percentage = ethDominancePercentage,
                Bitcoin_dominance_price = btcDominance,
                Ethereum_dominance_price = ethDominance,
                Altcoin_season_score = altcoinScore,
                TimestampUtc = DateTime.UtcNow,
            };

            // Save to DB
            await repo.AddAsync(globalMetric);
            await repo.SaveChangesAsync();

            var message = new
            {
                type = "GlobalMetric",
                data = new
                {
                    Total_market_cap_usd = totalMarketCap,
                    Total_market_cap_percent_change_24h = totalMarketCapChange24h,
                    Total_volume_24h = totalVolume24h,
                    Total_volume_24h_percent_change_24h = totalVolume24hChange24h,
                    Cmc_20 = 0,
                    fear_and_greed_index = fngValue.ToString(),
                    fear_and_greed_text = fngText,
                    Bitcoin_dominance_percentage = btcDominancePercentage,
                    Ethereum_dominance_percentage = ethDominancePercentage,
                    Bitcoin_dominance_price = btcDominance,
                    Ethereum_dominance_price = ethDominance,
                    Altcoin_season_score = altcoinScore,
                    TimestampUtc = DateTime.UtcNow,
                }
            };

            // Realtime update via SignalR
            await _hubContext.Clients.All.SendAsync("ReceiveGlobalMetric", message, stoppingToken);

            _logger.LogInformation($"✅ Global metrics updated at {DateTime.UtcNow}. MarketCap: {totalMarketCap}, FNG: {fngValue}, AltcoinScore: {altcoinScore}");

            return globalMetric;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await FetchAndSaveMetricsAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error fetching global metrics");
                }
                // Wait for 5 minutes before next fetch
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }
}
