namespace MarketAnalysisBackend.Models
{
    public class PricePoint
    {
        public long Id { get; set; }
        public int AssetId { get; set; }
        public Asset Asset { get; set; } = null!;
        public DateTime TimestampUtc { get; set; }
        public decimal Price { get; set; } 

        public decimal Open { get; set; }
        public decimal Close { get; set; }
        public decimal High { get; set; }
        public decimal Low { get; set; }

        public decimal PercentChange1h { get; set; }
        public decimal PercentChange24h { get; set; }
        public decimal PercentChange7d { get; set; }
        public decimal MarketCap { get; set; }
        public decimal Volume { get; set; }
        public string Source { get; set; } = string.Empty;

    }
}
