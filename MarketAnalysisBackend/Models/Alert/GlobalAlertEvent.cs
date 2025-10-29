using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketAnalysisBackend.Models.Alert
{
    public class GlobalAlertEvent
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int RuleId { get; set; }

        [Required]
        public int AssetId { get; set; }

        [Required, MaxLength(20)]
        public string AssetSymbol { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string EventType { get; set; } = string.Empty;

        [Required, Column(TypeName = "decimal(18,8)")]
        public decimal TriggerValue { get; set; }

        [Column(TypeName = "decimal(18,8)")]
        public decimal? PreviousValue { get; set; }

        [Column(TypeName = "decimal(8,4)")]
        public decimal? PercentChange { get; set; }

        [MaxLength(20)]
        public string? TimeWindow { get; set; }

        [Required, MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string Severity { get; set; } = "INFO";

        public DateTime TriggeredAt { get; set; } = DateTime.UtcNow;

        public int NotificationsSent { get; set; } = 0;

        [MaxLength(20)]
        public string NotificationStatus { get; set; } = "PENDING";

        [ForeignKey("RuleId")]
        public virtual GlobalAlertRule? Rule { get; set; }

        [ForeignKey("AssetId")]
        public virtual Asset? Asset { get; set; }

        public virtual ICollection<UserAlertView> UserViews { get; set; } = new List<UserAlertView>();
    }
}
