using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.AI;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace MarketAnalysisBackend.Services.Implementations
{
    /// <summary>
    /// AI Analysis Service using Google Gemini API
    /// </summary>
    public class GeminiAiAnalysisService : IAiAnalysisService
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly ILogger<GeminiAiAnalysisService> _logger;
        private readonly GeminiSettings _settings;
        private readonly IHttpClientFactory _httpClientFactory;

        public GeminiAiAnalysisService(
            AppDbContext context,
            IHttpClientFactory httpClientFactory,
            IMemoryCache cache,
            ILogger<GeminiAiAnalysisService> logger,
            IOptions<GeminiSettings> settings)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _cache = cache;
            _logger = logger;
            _settings = settings.Value;
        }

        public async Task<CoinAnalysisReponse> AnalyzeCoinAsync(string symbol, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"🤖 Starting Gemini AI analysis for {symbol}");

            // Cache key per hour
            var cacheKey = $"gemini_analysis_{symbol}_{DateTime.UtcNow:yyyyMMdd_HH}";
            if (_cache.TryGetValue(cacheKey, out CoinAnalysisReponse? cachedResult))
            {
                _logger.LogInformation($"✅ Returning cached analysis for {symbol}");
                return cachedResult!;
            }

            // 1. Get price data from database
            var priceData = await GetPriceDataFromDB(symbol, cancellationToken);
            if (priceData.Count == 0)
            {
                throw new Exception($"Not enough price data for {symbol} to perform analysis");
            }

            // 2. Calculate metrics
            var metrics = CalculateMetrics(priceData);

            // 3. Build prompt
            var prompt = BuildPrompt(symbol, priceData, metrics);

            // 4. Call Gemini API
            _logger.LogInformation($"📡 Calling Gemini API for {symbol}");
            var aiResponse = await CallGeminiAsync(prompt, cancellationToken);

            // 5. Parse response
            var analysis = ParseAnalysis(symbol, aiResponse, metrics);

            // 6. Cache result for 1 hour
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(1));
            _cache.Set(cacheKey, analysis, cacheOptions);

            _logger.LogInformation($"✅ Gemini AI analysis completed for {symbol}");
            return analysis;
        }

        public async Task<List<CoinAnalysisReponse>> AnalyzeMultipleCoinsAsync(List<string> symbols, CancellationToken cancellationToken = default)
        {
            var tasks = symbols.Select(s => AnalyzeCoinAsync(s, cancellationToken));
            var results = await Task.WhenAll(tasks);
            return results.ToList();
        }

        public async Task<MarketOverviewResponse> AnalyzeMarketAsync(CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("🌍 Starting market overview AI analysis");

            // Cache key per hour
            var cacheKey = $"market_overview_{DateTime.UtcNow:yyyyMMdd_HH}";
            if (_cache.TryGetValue(cacheKey, out MarketOverviewResponse? cachedResult))
            {
                _logger.LogInformation("✅ Returning cached market overview");
                return cachedResult!;
            }

            // 1. Get all assets with latest price data
            var marketData = await GetMarketDataFromDB(cancellationToken);
            if (!marketData.Any())
            {
                throw new Exception("No market data available for analysis");
            }

            // 2. Calculate comprehensive market statistics
            var stats = CalculateMarketStatistics(marketData);

            // 3. Identify top movers
            var topGainers = marketData
                .Where(m => m.PercentChange24h > 0)
                .OrderByDescending(m => m.PercentChange24h)
                .Take(5)
                .Select(m => new TopMover
                {
                    Symbol = m.Symbol,
                    Name = m.Name,
                    Price = m.Price,
                    PercentChange24h = m.PercentChange24h,
                    MarketCap = m.MarketCap
                })
                .ToList();

            var topLosers = marketData
                .Where(m => m.PercentChange24h < 0)
                .OrderBy(m => m.PercentChange24h)
                .Take(5)
                .Select(m => new TopMover
                {
                    Symbol = m.Symbol,
                    Name = m.Name,
                    Price = m.Price,
                    PercentChange24h = m.PercentChange24h,
                    MarketCap = m.MarketCap
                })
                .ToList();

            // 4. Build market analysis prompt
            var prompt = BuildMarketPrompt(marketData, stats, topGainers, topLosers);

            // 5. Call Gemini API
            _logger.LogInformation("📡 Calling Gemini API for market analysis");
            var aiResponse = await CallGeminiAsync(prompt, cancellationToken);

            // 6. Parse response
            var analysis = ParseMarketAnalysis(aiResponse, stats, topGainers, topLosers);

            // 7. Cache result for 1 hour
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(1));
            _cache.Set(cacheKey, analysis, cacheOptions);

            _logger.LogInformation("✅ Market overview AI analysis completed");
            return analysis;
        }

        private async Task<List<PricePoint>> GetPriceDataFromDB(string symbol, CancellationToken cancellationToken)
        {
            _logger.LogInformation($"📊 Fetching price data for {symbol} from database");

            var asset = await _context.Assets
                .FirstOrDefaultAsync(a => a.Symbol.ToUpper() == symbol.ToUpper(), cancellationToken);

            if (asset == null)
            {
                throw new Exception($"Asset {symbol} not found in database");
            }

            // Get last 30 days of data
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            var prices = await _context.PricePoints
                .Where(p => p.AssetId == asset.Id && p.TimestampUtc >= thirtyDaysAgo)
                .OrderBy(p => p.TimestampUtc)
                .ToListAsync(cancellationToken);

            _logger.LogInformation($"📈 Found {prices.Count} price points for {symbol}");
            return prices;
        }

        private PriceMetrics CalculateMetrics(List<PricePoint> priceData)
        {
            var latest = priceData.Last();
            var oldest = priceData.First();

            var prices = priceData.Select(p => p.Price).ToList();
            var volumes = priceData.Select(p => p.Volume).ToList();

            return new PriceMetrics
            {
                CurrentPrice = latest.Price,
                OldestPrice = oldest.Price,
                HighestPrice = priceData.Max(p => p.High),
                LowestPrice = priceData.Min(p => p.Low),
                AverageVolume = volumes.Average(),
                PercentChange = ((latest.Price - oldest.Price) / oldest.Price) * 100,
                MA7 = prices.Count >= 7 ? prices.TakeLast(7).Average() : prices.Average(),
                MA14 = prices.Count >= 14 ? prices.TakeLast(14).Average() : prices.Average(),
                MA30 = prices.Average(),
                Volatility = CalculateVolatility(prices)
            };
        }

        private double CalculateVolatility(List<decimal> prices)
        {
            if (prices.Count < 2) return 0;

            var returns = new List<double>();
            for (int i = 1; i < prices.Count; i++)
            {
                var ret = (double)((prices[i] - prices[i - 1]) / prices[i - 1]);
                returns.Add(ret);
            }

            var avg = returns.Average();
            var variance = returns.Select(r => Math.Pow(r - avg, 2)).Average();
            return Math.Sqrt(variance);
        }

        private string BuildPrompt(string symbol, List<PricePoint> priceData, PriceMetrics metrics)
        {
            var sb = new StringBuilder();

            sb.AppendLine($"You are an expert cryptocurrency market analyst with 10+ years of experience.");
            sb.AppendLine();
            sb.AppendLine($"=== {symbol} 30-DAY DATA ===");
            sb.AppendLine();

            // Overview
            sb.AppendLine("OVERVIEW:");
            sb.AppendLine($"- Current price: ${metrics.CurrentPrice:N2}");
            sb.AppendLine($"- Price 30 days ago: ${metrics.OldestPrice:N2}");
            sb.AppendLine($"- 30-day change: {metrics.PercentChange:+0.00;-0.00}%");
            sb.AppendLine($"- 30d high: ${metrics.HighestPrice:N2}");
            sb.AppendLine($"- 30d low: ${metrics.LowestPrice:N2}");
            sb.AppendLine($"- Average volume: {metrics.AverageVolume:N0}");
            sb.AppendLine();

            // Technical indicators
            sb.AppendLine("TECHNICAL INDICATORS:");
            sb.AppendLine($"- MA(7): ${metrics.MA7:N2}");
            sb.AppendLine($"- MA(14): ${metrics.MA14:N2}");
            sb.AppendLine($"- MA(30): ${metrics.MA30:N2}");
            sb.AppendLine($"- Volatility: {metrics.Volatility:P2}");
            sb.AppendLine();

            // Last 7 days detail
            sb.AppendLine("LAST 7 DAYS DETAIL:");
            var last7Days = priceData.TakeLast(7).ToList();
            foreach (var day in last7Days)
            {
                sb.AppendLine($"  {day.TimestampUtc:yyyy-MM-dd}: ${day.Price:N2}, Vol: {day.Volume:N0}");
            }
            sb.AppendLine();

            // Requirements
            sb.AppendLine("=== TASK ===");
            sb.AppendLine($"Analyze and provide EXACTLY 4-5 key insights about {symbol}.");
            sb.AppendLine();
            sb.AppendLine("REQUIREMENTS:");
            sb.AppendLine("1. Each insight must be concise (1-2 sentences)");
            sb.AppendLine("2. Classify as: positive, negative, or neutral");
            sb.AppendLine("3. Focus on: price trends, volume, support/resistance levels, recommendations");
            sb.AppendLine();
            sb.AppendLine("4. JSON format (NO markdown backticks, ONLY pure JSON):");
            sb.AppendLine(@"{
  ""insights"": [
    {
      ""title"": ""Short title"",
      ""description"": ""Detailed description"",
      ""type"": ""positive""
    }
  ]
}");
            sb.AppendLine();
            sb.AppendLine("⚠️ RETURN ONLY JSON, NO OTHER TEXT!");

            return sb.ToString();
        }

        private async Task<string> CallGeminiAsync(string prompt, CancellationToken cancellationToken)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                
                // Build Gemini API endpoint
                var endpoint = $"{_settings.ApiUrl}/{_settings.Model}:generateContent?key={_settings.ApiKey}";

                // Build request body for Gemini API
                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = prompt }
                            }
                        }
                    },
                    generationConfig = new
                    {
                        temperature = _settings.Temperature,
                        maxOutputTokens = _settings.MaxTokens,
                        responseMimeType = "application/json"
                    }
                };

                _logger.LogInformation($"🌐 Calling Gemini endpoint: {_settings.Model}");
                
                var response = await client.PostAsJsonAsync(endpoint, requestBody, cancellationToken);
                
                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogError($"Gemini API error: {error}");
                    throw new Exception($"Gemini API error: {error}");
                }

                var jsonResponse = await response.Content.ReadFromJsonAsync<GeminiResponse>(cancellationToken);
                
                if (jsonResponse?.Candidates == null || !jsonResponse.Candidates.Any())
                {
                    throw new Exception("Gemini API returned no candidates");
                }

                var content = jsonResponse.Candidates[0].Content.Parts[0].Text;
                _logger.LogInformation($"✅ Received response from Gemini ({content.Length} chars)");
                
                return content ?? throw new Exception("Gemini response content is null");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Gemini API");
                throw;
            }
        }

        private CoinAnalysisReponse ParseAnalysis(string symbol, string aiResponse, PriceMetrics metrics)
        {
            try
            {
                // Clean response - Gemini sometimes adds extra text
                var jsonContent = aiResponse.Trim();
                if (jsonContent.StartsWith("```json"))
                {
                    jsonContent = jsonContent.Replace("```json", "")
                        .Replace("```", "")
                        .Trim();
                }

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var analysisData = JsonSerializer.Deserialize<AIAnalysisData>(jsonContent, options);

                if (analysisData?.Insights == null || !analysisData.Insights.Any())
                {
                    throw new Exception("Gemini AI không trả về insights");
                }

                return new CoinAnalysisReponse
                {
                    Symbol = symbol,
                    AnalyzedAt = DateTime.UtcNow,
                    Insights = analysisData.Insights,
                    Source = $"Gemini {_settings.Model}",
                    CurrentPrice = metrics.CurrentPrice,
                    PercentChange7d = (double)metrics.PercentChange
                };
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, $"Failed to parse Gemini response: {aiResponse}");
                throw new Exception("Không thể parse response từ Gemini AI", ex);
            }
        }

        #region Helper Classes

        private class PriceMetrics
        {
            public decimal CurrentPrice { get; set; }
            public decimal OldestPrice { get; set; }
            public decimal HighestPrice { get; set; }
            public decimal LowestPrice { get; set; }
            public decimal AverageVolume { get; set; }
            public decimal PercentChange { get; set; }
            public decimal MA7 { get; set; }
            public decimal MA14 { get; set; }
            public decimal MA30 { get; set; }
            public double Volatility { get; set; }
        }

        private class GeminiResponse
        {
            [JsonPropertyName("candidates")]
            public List<GeminiCandidate> Candidates { get; set; } = new();
        }

        private class GeminiCandidate
        {
            [JsonPropertyName("content")]
            public GeminiContent Content { get; set; } = new();
        }

        private class GeminiContent
        {
            [JsonPropertyName("parts")]
            public List<GeminiPart> Parts { get; set; } = new();
        }

        private class GeminiPart
        {
            [JsonPropertyName("text")]
            public string Text { get; set; } = string.Empty;
        }

        // Market Analysis Helper Classes
        private class MarketDataPoint
        {
            public string Symbol { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
            public decimal Price { get; set; }
            public decimal MarketCap { get; set; }
            public decimal Volume24h { get; set; }
            public decimal PercentChange24h { get; set; }
        }

        // Market Analysis Helper Methods
        private async Task<List<MarketDataPoint>> GetMarketDataFromDB(CancellationToken cancellationToken)
        {
            _logger.LogInformation("📊 Fetching all market data from database");

            // Get latest price point for each asset to fetch volume data
            var latestPrices = from asset in _context.Assets
                               where asset.Symbol != null && asset.Name != null
                               let latestPrice = _context.PricePoints
                                   .Where(p => p.AssetId == asset.Id)
                                   .OrderByDescending(p => p.TimestampUtc)
                                   .FirstOrDefault()
                               where latestPrice != null
                               select new MarketDataPoint
                               {
                                   Symbol = asset.Symbol,
                                   Name = asset.Name,
                                   Price = latestPrice.Price,
                                   MarketCap = latestPrice.MarketCap > 0 ? latestPrice.MarketCap : latestPrice.Price * 1000000,
                                   Volume24h = latestPrice.Volume,
                                   PercentChange24h = latestPrice.PercentChange24h
                               };

            var marketData = await latestPrices.ToListAsync(cancellationToken);
            _logger.LogInformation($"📈 Retrieved {marketData.Count} assets with volume data");
            return marketData;
        }

        private MarketStatistics CalculateMarketStatistics(List<MarketDataPoint> marketData)
        {
            var stats = new MarketStatistics
            {
                TotalCoins = marketData.Count,
                TotalMarketCap = marketData.Sum(m => m.MarketCap),
                TotalVolume24h = marketData.Sum(m => m.Volume24h),
                CoinsUp = marketData.Count(m => m.PercentChange24h > 0),
                CoinsDown = marketData.Count(m => m.PercentChange24h < 0)
            };

            // Market breadth
            stats.MarketBreadth = stats.TotalCoins > 0 
                ? (decimal)stats.CoinsUp / stats.TotalCoins 
                : 0;

            // BTC and ETH dominance
            var btc = marketData.FirstOrDefault(m => m.Symbol.ToUpper() == "BTC");
            var eth = marketData.FirstOrDefault(m => m.Symbol.ToUpper() == "ETH");
            
            stats.BtcDominance = stats.TotalMarketCap > 0 && btc != null
                ? (btc.MarketCap / stats.TotalMarketCap) * 100
                : 0;
            
            stats.EthDominance = stats.TotalMarketCap > 0 && eth != null
                ? (eth.MarketCap / stats.TotalMarketCap) * 100
                : 0;

            // Average and median changes
            var changes = marketData.Select(m => m.PercentChange24h).OrderBy(c => c).ToList();
            stats.AverageChange24h = changes.Any() ? changes.Average() : 0;
            stats.MedianChange24h = changes.Any() && changes.Count > 0
                ? changes[changes.Count / 2]
                : 0;

            // Volume to market cap ratio
            stats.VolumeToMarketCapRatio = stats.TotalMarketCap > 0
                ? (stats.TotalVolume24h / stats.TotalMarketCap) * 100
                : 0;

            // Volatility index (standard deviation of 24h changes)
            var avgChange = (double)stats.AverageChange24h;
            var variance = changes.Select(c => Math.Pow((double)c - avgChange, 2)).Average();
            stats.VolatilityIndex = (decimal)Math.Sqrt(variance);

            return stats;
        }

        private string BuildMarketPrompt(List<MarketDataPoint> marketData, MarketStatistics stats, 
            List<TopMover> topGainers, List<TopMover> topLosers)
        {
            var sb = new StringBuilder();

            sb.AppendLine("You are an expert cryptocurrency market analyst with 10+ years of experience.");
            sb.AppendLine();
            sb.AppendLine("=== COMPREHENSIVE MARKET OVERVIEW ===");
            sb.AppendLine();

            sb.AppendLine("MARKET STATISTICS:");
            sb.AppendLine($"- Total Market Cap: ${stats.TotalMarketCap:N0}");
            sb.AppendLine($"- Total 24h Volume: ${stats.TotalVolume24h:N0}");
            sb.AppendLine($"- Volume/Market Cap Ratio: {stats.VolumeToMarketCapRatio:F2}%");
            sb.AppendLine($"- Total Coins Analyzed: {stats.TotalCoins}");
            sb.AppendLine();

            sb.AppendLine("MARKET DOMINANCE:");
            sb.AppendLine($"- Bitcoin (BTC): {stats.BtcDominance:F2}%");
            sb.AppendLine($"- Ethereum (ETH): {stats.EthDominance:F2}%");
            sb.AppendLine($"- Others: {100 - stats.BtcDominance - stats.EthDominance:F2}%");
            sb.AppendLine();

            sb.AppendLine("MARKET BREADTH:");
            sb.AppendLine($"- Coins Up (24h): {stats.CoinsUp} ({stats.MarketBreadth * 100:F1}%)");
            sb.AppendLine($"- Coins Down (24h): {stats.CoinsDown} ({(1 - stats.MarketBreadth) * 100:F1}%)");
            sb.AppendLine($"- Average Change: {stats.AverageChange24h:+0.00;-0.00}%");
            sb.AppendLine($"- Median Change: {stats.MedianChange24h:+0.00;-0.00}%");
            sb.AppendLine();

            sb.AppendLine("VOLATILITY:");
            sb.AppendLine($"- Volatility Index: {stats.VolatilityIndex:F2}%");
            sb.AppendLine();

            sb.AppendLine("TOP 5 GAINERS (24h):");
            foreach (var gainer in topGainers)
            {
                sb.AppendLine($"  {gainer.Symbol} ({gainer.Name}): +{gainer.PercentChange24h:F2}% | ${gainer.Price:N2} | MCap: ${gainer.MarketCap:N0}");
            }
            sb.AppendLine();

            sb.AppendLine("TOP 5 LOSERS (24h):");
            foreach (var loser in topLosers)
            {
                sb.AppendLine($"  {loser.Symbol} ({loser.Name}): {loser.PercentChange24h:F2}% | ${loser.Price:N2} | MCap: ${loser.MarketCap:N0}");
            }
            sb.AppendLine();

            sb.AppendLine("=== ANALYSIS TASK ===");
            sb.AppendLine("Analyze the cryptocurrency market and provide 5-7 key insights covering:");
            sb.AppendLine("1. Overall market trend (bullish/bearish/neutral)");
            sb.AppendLine("2. Market sentiment based on breadth and dominance");
            sb.AppendLine("3. Volume analysis and liquidity");
            sb.AppendLine("4. Volatility assessment");
            sb.AppendLine("5. Notable patterns or anomalies");
            sb.AppendLine("6. Short-term outlook");
            sb.AppendLine();
            sb.AppendLine("Also determine:");
            sb.AppendLine("- overallTrend: 'bullish', 'bearish', or 'neutral'");
            sb.AppendLine();
            sb.AppendLine("JSON format (NO markdown backticks, ONLY pure JSON):");
            sb.AppendLine(@"{
  ""overallTrend"": ""bullish"",
  ""insights"": [
    {
      ""title"": ""Market Trend"",
      ""description"": ""Brief analysis..."",
      ""type"": ""positive""
    }
  ]
}");
            sb.AppendLine();
            sb.AppendLine("⚠️ RETURN ONLY JSON, NO OTHER TEXT!");

            return sb.ToString();
        }

        private MarketOverviewResponse ParseMarketAnalysis(string aiResponse, MarketStatistics stats,
            List<TopMover> topGainers, List<TopMover> topLosers)
        {
            try
            {
                // Clean response
                var jsonContent = aiResponse.Trim();
                if (jsonContent.StartsWith("```json"))
                {
                    jsonContent = jsonContent.Replace("```json", "").Replace("```", "").Trim();
                }

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var analysisData = JsonSerializer.Deserialize<MarketAnalysisData>(jsonContent, options);

                if (analysisData?.Insights == null || !analysisData.Insights.Any())
                {
                    throw new Exception("Gemini AI returned no insights");
                }

                return new MarketOverviewResponse
                {
                    AnalyzedAt = DateTime.UtcNow,
                    OverallTrend = analysisData.OverallTrend ?? "neutral",
                    Insights = analysisData.Insights,
                    TopGainers = topGainers,
                    TopLosers = topLosers,
                    Statistics = stats,
                    Source = $"Gemini {_settings.Model}"
                };
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, $"Failed to parse market analysis: {aiResponse}");
                throw new Exception("Failed to parse Gemini AI response", ex);
            }
        }

        private class MarketAnalysisData
        {
            public string? OverallTrend { get; set; }
            public List<Insight> Insights { get; set; } = new();
        }

        #endregion
    }
}
