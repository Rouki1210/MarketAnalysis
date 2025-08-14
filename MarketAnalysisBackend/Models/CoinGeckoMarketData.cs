namespace MarketAnalysisBackend.Models
{
    public class CoinGeckoMarketData 
    {
        public string id {  get; set; } = string.Empty;
        public string symbol { get; set; } = string.Empty;
        public string name { get; set; } = string.Empty;
        public decimal current_price { get; set; }
        public decimal high_24h { get; set; }
        public decimal low_24h { get; set;}
        public decimal total_volume { get; set; }
        public long last_updated { get; set; }
    }
}
