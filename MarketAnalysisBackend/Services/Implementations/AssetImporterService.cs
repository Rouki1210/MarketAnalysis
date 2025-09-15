using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class AssetImporterService : BackgroundService
    {
        private readonly ILogger<AssetImporterService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly string _apiKey;

        public AssetImporterService(
            ILogger<AssetImporterService> logger,
            IHttpClientFactory httpClientFactory,
            IServiceScopeFactory scopeFactory,
            IConfiguration config)
        {
            _logger = logger;
            _httpClientFactory = httpClientFactory;
            _scopeFactory = scopeFactory;
            _apiKey = config["CoinMarketCap:ApiKey"] ?? throw new ArgumentNullException("CMC API Key missing");
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("CMC AssetImporterService started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var assetRepo = scope.ServiceProvider.GetRequiredService<IGenericRepository<Asset>>();
                    var client = _httpClientFactory.CreateClient();
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    client.DefaultRequestHeaders.Add("X-CMC_PRO_API_KEY", _apiKey);

                    // Step 1: get symbol, name, rank
                    var mapResponse = await client.GetFromJsonAsync<CmcMap>(
                        "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map",
                        stoppingToken);

                    if (mapResponse != null)
                    {
                        foreach (var cmc in mapResponse.Data) // lấy 20 coin đầu để demo
                        {
                            var exists = (await assetRepo.GetAllAsync())
                                .Any(a => a.Symbol.ToUpper() == cmc.Symbol.ToUpper());

                            if (!exists)
                            {
                                // Step 2: get description từ info API
                                var infoUrl = $"https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?id={cmc.Id}";
                                var infoResponse = await client.GetFromJsonAsync<CmcInfoResponse>(infoUrl, stoppingToken);

                                var description = "";
                                if (infoResponse != null && infoResponse.Data.ContainsKey(cmc.Id.ToString()))
                                {
                                    description = infoResponse.Data[cmc.Id.ToString()].Description;
                                }

                                var newAsset = new Asset
                                {
                                    Symbol = cmc.Symbol,
                                    Name = cmc.Name,
                                    Rank = cmc.Rank.ToString(),
                                    Description = description
                                };

                                await assetRepo.AddAsync(newAsset);
                                _logger.LogInformation("Added new CMC asset {0} ({1})", cmc.Name, cmc.Symbol);
                            }
                        }

                        await assetRepo.SaveChangesAsync();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error importing assets from CoinMarketCap");
                }

                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}
