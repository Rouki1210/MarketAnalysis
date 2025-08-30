namespace MarketAnalysisBackend.Models
{
    public class PricePointDTO
    {
        public long Id { get; set; }
        public string Symbol { get; set; }
        public decimal Close {  get; set; }
        public DateTime TimestampUtc { get; set; }
        public decimal Volume { get; set; }
        public string Source { get; set; }
    }
}
