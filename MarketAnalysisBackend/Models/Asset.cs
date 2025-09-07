namespace MarketAnalysisBackend.Models
{
    public class Asset
    {
        public int Id { get; set; }
        public string Symbol { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Rank { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public ICollection<PricePoint> PricePoints { get; set; } = new List<PricePoint>();
    }
}
