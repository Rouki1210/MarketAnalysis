namespace MarketAnalysisBackend.Models
{
    public class PricePoint
    {
        public long Id { get; set; }
        public int AssetId { get; set; }
        public Asset Assets { get; set; } = null!;
        public DateTime TimestampUtc { get; set; }
        public decimal Open { get; set; }
        public decimal Close { get; set; }
        public decimal High { get; set; }
        public decimal Low { get; set; }
        public decimal Volume { get; set; }
        public string Source { get; set; } = string.Empty;

    }
}
