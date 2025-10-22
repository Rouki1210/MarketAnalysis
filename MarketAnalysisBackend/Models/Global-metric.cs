namespace MarketAnalysisBackend.Models
{
    public class Global_metric
    {
        public int Id { get; set; }
        public decimal Total_market_cap_usd { get; set; }
        public decimal Cmc_20 { get; set; }
        public string fear_and_greed_index { get; set; } = string.Empty;
        public string fear_and_greed_text { get; set; } = string.Empty;
        public decimal Bitcoin_dominance_percentage { get; set; }
        public decimal Bitcoin_dominance_price { get; set; }
        public decimal Ethereum_dominance_percentage { get; set; }
        public decimal Ethereum_dominance_price { get; set; }
        public int Altcoin_season_score { get; set; }

        public DateTime TimestampUtc { get; set; }

    }
}
