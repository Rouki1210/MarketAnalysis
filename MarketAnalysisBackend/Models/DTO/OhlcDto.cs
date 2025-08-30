namespace MarketAnalysisBackend.Models.DTO
{
    public class OhlcDto
    {
        public string Symbol { get; set; }
        public DateTime PeriodStart { get; set; }
        public decimal Open { get; set; }
        public decimal High { get; set; }
        public decimal Low { get; set; }
        public decimal Close { get; set; }
        public decimal Volume { get; set; }
    }
}
