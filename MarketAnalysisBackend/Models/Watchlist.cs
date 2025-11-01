using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketAnalysisBackend.Models
{
    public class Watchlist
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public bool IsFavorite { get; set; } = false;

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        public virtual ICollection<WatchlistItems> WatchlistItems { get; set; } = new List<WatchlistItems>();
    }
}
