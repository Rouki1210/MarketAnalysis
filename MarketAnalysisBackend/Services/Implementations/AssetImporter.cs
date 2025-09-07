using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Interfaces;
using System.Text.Json;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class AssetImporter : IAssetImport
    {
        private readonly ILogger<AssetImporter> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IGenericRepository<Asset> _assetRepo;
        private readonly string _apiKey;

        public AssetImporter(
            ILogger<AssetImporter> logger,
            IHttpClientFactory httpClientFactory,
            IGenericRepository<Asset> assetRepo,
            IConfiguration config)
        {
            _logger = logger;
            _httpClientFactory = httpClientFactory;
            _assetRepo = assetRepo;
            _apiKey = config["CoinMarketCap:ApiKey"] ?? throw new ArgumentNullException("CMC API Key missing");
        }

        public async Task<IEnumerable<Asset>> GetByRankRangeAsync(int from, int to)
        {
            var assets = await _assetRepo.GetAllAsync();
            return assets
                .Where(a => int.TryParse(a.Rank, out int rank) && rank >= from && rank <= to)
                .OrderBy(a => int.Parse(a.Rank))
                .Select(a => new Asset
                {
                    Id = a.Id,
                    Symbol = a.Symbol,
                    Name = a.Name,
                    Rank = a.Rank,
                    Description = a.Description
                });
        }

        public async Task<IEnumerable<Asset>> ImportAssetByRank(int fromRank, int toRank, bool updateExisting, CancellationToken cancellationToken = default)
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.Add("X-CMC_PRO_API_KEY", _apiKey);

            var url = $"https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit={toRank}&sort=market_cap";
            var response = await client.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new Exception($"CMC API error: {error}");
            }
            var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken);
            var data = json.GetProperty("data").EnumerateArray();

            var existingAssets = await _assetRepo.GetAllAsync();
            var bySymbol = existingAssets.ToDictionary(a => a.Symbol.ToUpper(), a => a);
            var result = new List<Asset>();
            foreach (var d in data)
            {
                var rank = d.TryGetProperty("cmc_rank", out var r) ? r.GetInt32() : int.MaxValue;
                if (rank < fromRank || rank > toRank) continue;

                var id = d.GetProperty("id").GetInt32();
                var symbol = d.GetProperty("symbol").GetString()!.ToUpper();
                var name = d.GetProperty("name").GetString() ?? "";
                var price = d.GetProperty("quote").GetProperty("USD").GetProperty("price").GetDecimal();
                var description = "";
                try
                {
                    var infoUrl = $"https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?id={id}";
                    var infoResponse = await client.GetFromJsonAsync<CmcInfoResponse>(infoUrl, cancellationToken);

                    if (infoResponse != null && infoResponse.Data.ContainsKey(id.ToString()))
                    {
                        description = infoResponse.Data[id.ToString()].Description ?? "";
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not fetch description for {0}", name);
                }


                if (!bySymbol.TryGetValue(symbol, out var asset))
                {
                    // thêm mới
                    asset = new Asset
                    {
                        Symbol = symbol,
                        Name = name,
                        Rank = rank.ToString(),
                        Description = description,
                    };
                    await _assetRepo.AddAsync(asset);
                }

                else if (updateExisting)
                {
                    // cập nhật
                    asset.Name = name;
                    asset.Rank = rank.ToString();
                    if (!string.IsNullOrWhiteSpace(description))
                        asset.Description = description;
                    else if (updateExisting)
                    {
                        // cập nhật
                        asset.Name = name;
                        asset.Rank = rank.ToString();
                        if (!string.IsNullOrWhiteSpace(description))
                            asset.Description = description;

                        await _assetRepo.UpdateAsync(asset);
                    }
                    await _assetRepo.UpdateAsync(asset);

                }

                result.Add(asset);
            }

            await _assetRepo.SaveChangesAsync();
            return result.OrderBy(a => int.Parse(a.Rank)).ToList();
        }

        public async Task ImportAssetsAsync(CancellationToken cancellationToken = default)
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.Add("X-CMC_PRO_API_KEY", _apiKey);

           var mapResponse = await client.GetFromJsonAsync<CmcMap>(
                "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map",
                cancellationToken);

            if (mapResponse == null || !mapResponse.Data.Any())
            {
                return;
            }

            var existingAssets = await _assetRepo.GetAllAsync();

            foreach(var cmc in mapResponse.Data)
            {
                if (existingAssets.Any(a => a.Symbol.ToUpper() == cmc.Symbol.ToUpper()))
                    continue;

                // gọi thêm info để lấy description
                string description = "";
                try
                {
                    var infoUrl = $"https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?id={cmc.Id}";
                    var infoResponse = await client.GetFromJsonAsync<CmcInfoResponse>(infoUrl, cancellationToken);

                    if (infoResponse != null && infoResponse.Data.ContainsKey(cmc.Id.ToString()))
                    {
                        description = infoResponse.Data[cmc.Id.ToString()].Description ?? "";
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not fetch description for {0}", cmc.Name);
                }

                var newAsset = new Asset
                {
                    Symbol = cmc.Symbol,
                    Name = cmc.Name,
                    Rank = cmc.Rank.ToString(),
                    Description = description
                };

                await _assetRepo.AddAsync(newAsset);
                _logger.LogInformation("Added new asset {0} ({1})", cmc.Name, cmc.Symbol);
            }

            await _assetRepo.SaveChangesAsync();
        }
    }
}
