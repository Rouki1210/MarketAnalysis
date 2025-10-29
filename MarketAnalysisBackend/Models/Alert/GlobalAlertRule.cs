using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketAnalysisBackend.Models.Alert
{
    public class GlobalAlertRule
    {
        [Key]
        public int Id { get; set; }
        [Required, MaxLength(100)]
        public string RuleName { get; set; } = string.Empty;
        [Required, MaxLength(100)]
        public string RuleType { get; set; } = string.Empty;
        public decimal? ThresholdValue { get; set; }

        public decimal? PercentChange { get; set; }

        public int? TimeWindowMinutes { get; set; }

        public bool IsActive { get; set; } = true;

        [Required, MaxLength(20)]
        public string Priority { get; set; } = "NORMAL";

        public int CooldownMinutes { get; set; } = 15;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? CreatedBy { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [ForeignKey("AssetId")]
        public virtual Asset? Asset { get; set; }
    }
}
