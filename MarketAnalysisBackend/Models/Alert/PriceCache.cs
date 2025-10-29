using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketAnalysisBackend.Models.Alert
{
    public class PriceCache
    {
        [Key]
        public int AssetId { get; set; }
        public decimal CurrentPrice { get; set; }
        public decimal Price1hAgo { get; set; }
        public decimal Price24hAgo { get; set; }
        public decimal Price7dAgo { get; set; }
        public decimal Volume24h { get; set; }
        public DateTime LastUpdate { get; set; } = DateTime.UtcNow;
        [ForeignKey("AssetId")]
        public virtual Asset? Asset { get; set; }
    }
}
