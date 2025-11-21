namespace MarketAnalysisBackend.Models.Alert
{
    public class UserAlert
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int AssetId { get; set; }
        public string AlertType { get; set; } = string.Empty; // e.g., "Above", "Below"
        public string AssetSymbol { get; set; } = string.Empty;
        public decimal TargetPrice { get; set; }
        public bool IsRepeating { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public string Note { get; set; } = string.Empty;
        public int TriggerCount { get; set; } = 0;
        public decimal? LastKnownPrice { get; set; }
        public DateTime LastPriceCheckAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastTriggedAt { get; set; }
        public virtual User? User { get; set; }
        public virtual Asset? Asset { get; set; }
        public virtual ICollection<UserAlertHistories> History { get; set; } = new List<UserAlertHistories>();
    }
}
