namespace MarketAnalysisBackend.Models.AI
{
    public class CoinAnalysisReponse
    {
        public string Symbol { get; set; } = string.Empty;
        public DateTime AnalyzedAt { get; set; }
        public List<Insight> Insights { get; set; } = new();
        public string Source { get; set; } = string.Empty;
        public decimal CurrentPrice { get; set; }
        public double PercentChange7d { get; set; }
    }
}
