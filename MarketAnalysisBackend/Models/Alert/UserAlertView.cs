using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketAnalysisBackend.Models.Alert
{
    public class UserAlertView
    {
        [Key]
        public string Id { get; set; }
        [Required]
        public string UserId { get; set; }
        public int AlertEventId { get; set; }
        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
        [ForeignKey("AlertEventId")]
        public virtual GlobalAlertEvent? AlertEvent { get; set; }

    }
}
