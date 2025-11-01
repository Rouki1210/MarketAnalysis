namespace MarketAnalysisBackend.Models.DTO
{
    public class WatchlistDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<AssetDto> Assets { get; set; } = new();
    }

    public class AssetDto
    {
        public int Id { get; set; }
        public string Symbol { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
