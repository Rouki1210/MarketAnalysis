using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketAnalysisBackend.Models
{
    public class WatchlistItems
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int WatchlistId { get; set; }

        [Required]
        public int AssetId { get; set; }

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("WatchlistId")]
        public virtual Watchlist? Watchlist { get; set; }

        [ForeignKey("AssetId")]
        public virtual Asset? Asset { get; set; }
    }
}
