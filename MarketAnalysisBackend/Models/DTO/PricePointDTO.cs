namespace MarketAnalysisBackend.Models.DTO
{
    public class PricePointDTO
    {
        public long Id { get; set; }
        public string Symbol { get; set; }

        public string Name { get; set; }

        public decimal Price { get; set; }
        public DateTime TimestampUtc { get; set; }
        public decimal Volume { get; set; }
        public decimal MarketCap { get; set; }
        public decimal PercentChange1h { get; set; }
        public decimal PercentChange24h { get; set; }
        public decimal PercentChange7d { get; set; }
        public string Source { get; set; }
    }
}
