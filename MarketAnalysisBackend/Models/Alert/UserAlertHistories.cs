namespace MarketAnalysisBackend.Models.Alert
{
    public class UserAlertHistories
    {
        public int Id { get; set; }
        public int UserAlertId { get; set; }
        public int UserId { get; set; }
        public int AssetId { get; set; }
        public string AssetSymbol { get; set; } = string.Empty;
        public string AlertType { get; set; } = string.Empty;
        public DateTime TriggeredAt { get; set; } = DateTime.UtcNow;
        public decimal TriggeredPrice { get; set; }
        public decimal TargetPrice { get; set; }
        public decimal ActualPrice { get; set; }
        public decimal PriceDifference { get; set; }
        public bool WasNotified { get; set; } = false;
        public string NotificationMethod { get; set; } = "Pending";
        public string NotificationError { get; set; } = string.Empty;
        public DateTime ViewAt { get; set; }
        public virtual UserAlert? UserAlert { get; set; }
        public virtual User? User { get; set; }
        public virtual Asset? Asset { get; set; }
    }
}
