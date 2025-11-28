using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.AI;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class AiAnalysisService : IAiAnalysisService
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly ILogger<AiAnalysisService> _logger;
        private readonly OpenAISettings _settings;
        private readonly IPriceService _priceSer;
        private readonly IHttpClientFactory _httpClientFactory;
        public AiAnalysisService(
            AppDbContext context,
            IHttpClientFactory httpClientFactory,
            IMemoryCache cache,
            ILogger<AiAnalysisService> logger,
            IOptions<OpenAISettings> settings
            )
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _cache = cache;
            _logger = logger;
            _settings = settings.Value;
        }
        public async Task<CoinAnalysisReponse> AnalyzeCoinAsync(string symbol, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"🤖 Starting AI analysis for {symbol}");

            var cacheKey = $"ai_analysis_{symbol}_{DateTime.UtcNow:yyyyMMdd_HH}";
            if (_cache.TryGetValue(cacheKey, out CoinAnalysisReponse? cachedResult))
            {
                _logger.LogInformation($"✅ Returning cached analysis for {symbol}");
                return cachedResult!;
            }
            
            var priceData = await GetPriceDataFromDB(symbol, cancellationToken);
            if (priceData.Count == 0)
            {
                throw new Exception($"Not enough price data for {symbol} to perform analysis");
            }

            var metrics = CalculateMetrics(priceData);

            var prompt = BuildPrompt(symbol,priceData, metrics);

            _logger.LogInformation($"📡 Calling OpenAI API for {symbol}");
            var aiResponse = await CallOpenAIAsync(prompt, cancellationToken);

            var analysis = ParseAnalysis(symbol, aiResponse, metrics);

            var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromHours(1));
            _cache.Set(cacheKey, analysis, cacheOptions);

            _logger.LogInformation($"✅ AI analysis completed for {symbol}");
            return analysis;
        }

        public Task<List<CoinAnalysisReponse>> AnalyzeMultipleCoinsAsync(List<string> symbols, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<MarketOverviewResponse> AnalyzeMarketAsync(CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException("Market analysis is only available with Gemini service");
        }

        private async Task<List<PricePoint>> GetPriceDataFromDB(string symbol, CancellationToken cancellationToken)
        {
            _logger.LogInformation($"📊 Fetching price data for {symbol} from database");

            //var now = DateTime.UtcNow;
            //var thirtyDaysAgo = now.AddDays(-1);

            //var pricePointDtos = await _priceSer.GetPricePointsAsync(symbol, thirtyDaysAgo, now);

            //if (pricePointDtos == null || !pricePointDtos.Any())
            //{
            //    throw new Exception($"Không tìm thấy dữ liệu giá cho {symbol}");
            //}

            //var pricePoints = pricePointDtos.Select(dto => new PricePoint
            //{
            //    Id = dto.Id,
            //    TimestampUtc = dto.TimestampUtc,
            //    Price = dto.Price,
            //    Close = dto.Price, // PricePointDTO không có Close, dùng Price
            //    Open = dto.Price,
            //    High = dto.Price,
            //    Low = dto.Price,
            //    Volume = dto.Volume,
            //    MarketCap = dto.MarketCap,
            //    CirculatingSupply = dto.Supply,
            //    PercentChange1h = dto.PercentChange1h,
            //    PercentChange24h = dto.PercentChange24h,
            //    PercentChange7d = dto.PercentChange7d,
            //    Source = dto.Source
            //}).OrderBy(p => p.TimestampUtc).ToList();

            var asset = await _context.Assets
                .FirstOrDefaultAsync(a => a.Symbol.ToUpper() == symbol.ToUpper(), cancellationToken);

            if (asset == null)
            {
                throw new Exception($"Asset {symbol} not found in database");
            }

            var seventDaysAgo = DateTime.UtcNow.AddMinutes(-45);
            var prices = await _context.PricePoints
                .Where(p => p.AssetId == asset.Id && p.TimestampUtc >= seventDaysAgo)
                .OrderBy(p => p.TimestampUtc)
                .ToListAsync(cancellationToken);

            _logger.LogInformation($"📈 Found {prices.Count} price points for {symbol}");
            return prices;
        }

        private PriceMetrics CalculateMetrics(List<PricePoint> priceData)
        {
            var lastest = priceData.Last();
            var oldest = priceData.First();

            var prices = priceData.Select(p => p.Price).ToList();
            var volumes = priceData.Select(p => p.Volume).ToList();

            return new PriceMetrics
            {
                CurrentPrice = lastest.Price,
                OldestPrice = oldest.Price,
                HighestPrice = priceData.Max(p => p.High),
                LowestPrice = priceData.Min(p => p.Low),
                AverageVolume = volumes.Average(),
                PercentChange = ((lastest.Price - oldest.Price) / oldest.Price) * 100,
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

            sb.AppendLine($"Bạn là chuyên gia phân tích thị trường Cryptocurrency với 10+ năm kinh nghiệm.");
            sb.AppendLine();
            sb.AppendLine($"=== DỮ LIỆU 30 NGÀY CỦA {symbol} ===");
            sb.AppendLine();

            // Thông tin tổng quan
            sb.AppendLine("TỔNG QUAN:");
            sb.AppendLine($"- Giá hiện tại: ${metrics.CurrentPrice:N2}");
            sb.AppendLine($"- Giá 30 ngày trước: ${metrics.OldestPrice:N2}");
            sb.AppendLine($"- Thay đổi 30 ngày: {metrics.PercentChange:+0.00;-0.00}%");
            sb.AppendLine($"- Cao nhất (30d): ${metrics.HighestPrice:N2}");
            sb.AppendLine($"- Thấp nhất (30d): ${metrics.LowestPrice:N2}");
            sb.AppendLine($"- Volume trung bình: {metrics.AverageVolume:N0}");
            sb.AppendLine();

            // Moving Averages
            sb.AppendLine("CHỈ SỐ KỸ THUẬT:");
            sb.AppendLine($"- MA(7): ${metrics.MA7:N2}");
            sb.AppendLine($"- MA(14): ${metrics.MA14:N2}");
            sb.AppendLine($"- MA(30): ${metrics.MA30:N2}");
            sb.AppendLine($"- Volatility: {metrics.Volatility:P2}");
            sb.AppendLine();

            // Giá 7 ngày gần nhất
            sb.AppendLine("CHI TIẾT 7 NGÀY GẦN NHẤT:");
            var last7Days = priceData.TakeLast(7).ToList();
            foreach (var day in last7Days)
            {
                sb.AppendLine($"  {day.TimestampUtc:yyyy-MM-dd}: ${day.Price:N2}, Vol: {day.Volume:N0}");
            }
            sb.AppendLine();

            // Yêu cầu
            sb.AppendLine("=== NHIỆM VỤ ===");
            sb.AppendLine($"Hãy phân tích và đưa ra CHÍNH XÁC 4-5 nhận định quan trọng về {symbol}.");
            sb.AppendLine();
            sb.AppendLine("YÊU CẦU:");
            sb.AppendLine("1. Mỗi insight phải ngắn gọn (1-2 câu)");
            sb.AppendLine("2. Phân loại: positive (tích cực), negative (tiêu cực), neutral (trung lập)");
            sb.AppendLine("3. Tập trung vào: xu hướng giá, volume, mức hỗ trợ/kháng cự, khuyến nghị");
            sb.AppendLine();
            sb.AppendLine("4. Format JSON (KHÔNG thêm markdown backticks):");
            sb.AppendLine(@"{
  ""insights"": [
    {
      ""title"": ""Tiêu đề ngắn"",
      ""description"": ""Mô tả chi tiết"",
      ""type"": ""positive""
    }
  ]
}");
            sb.AppendLine();
            sb.AppendLine("⚠️ CHỈ TRẢ VỀ JSON, KHÔNG THÊM TEXT KHÁC!");

            return sb.ToString();
        }

        private async Task<string> CallOpenAIAsync(string prompt, CancellationToken cancellationToken)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_settings.ApiKey}");

                var requestBody = new
                {
                    model = _settings.Model,
                    messages = new[]
                    {
                        new
                        {
                            role = "system",
                            content = "You are a cryptocurrency market analyst. Always respond in Vietnamese and ONLY in valid JSON format without markdown code blocks."
                        },
                        new
                        {
                            role = "user",
                            content = prompt
                        }
                    },
                    max_tokens = _settings.MaxTokens,
                    temperature = _settings.Temperature
                };

                var response = await client.PostAsJsonAsync("https://api.openai.com/v1/chat/completions", requestBody, cancellationToken);
                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync(cancellationToken);
                    throw new Exception($"OpenAI API error: {error}");
                }
                var jsonResponse = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken);
                var content = jsonResponse
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();
                return content ?? throw new Exception("OpenAI response content is null");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling OpenAI API");
                throw;
            }
        }

        private CoinAnalysisReponse ParseAnalysis(string symbol, string aiResponse, PriceMetrics metrics)
        {
            try
            {
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
                    throw new Exception("AI không trả về insights");
                }

                return new CoinAnalysisReponse
                {
                    Symbol = symbol,
                    AnalyzedAt = DateTime.UtcNow,
                    Insights = analysisData.Insights,
                    Source = _settings.Model,
                    CurrentPrice = metrics.CurrentPrice,
                    PercentChange7d = (double)metrics.PercentChange
                };
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, $"Failed to parse AI response: {aiResponse}");
                throw new Exception("Không thể parse response từ AI", ex);
            }
        }

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
        }}
}
