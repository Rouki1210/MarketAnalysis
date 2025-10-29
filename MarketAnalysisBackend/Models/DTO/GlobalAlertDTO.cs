namespace MarketAnalysisBackend.Models.DTO
{
    public class GlobalAlertDTO
    {
        public class GlobalAlertEventDto
        {
            public long Id { get; set; }
            public string AssetSymbol { get; set; } = string.Empty;
            public string Message { get; set; } = string.Empty;
            public string Severity { get; set; } = string.Empty;
            public string EventType { get; set; } = string.Empty;
            public decimal TriggerValue { get; set; }
            public decimal? PreviousValue { get; set; }
            public decimal? PercentChange { get; set; }
            public string? TimeWindow { get; set; }
            public DateTime TriggeredAt { get; set; }
            public bool IsViewed { get; set; }
        }

        public class GetGlobalAlertsRequest
        {
            public int HoursBack { get; set; } = 24;
            public int Page { get; set; } = 1;
            public int PageSize { get; set; } = 50;
            public string? UserId { get; set; }
            public string MinimumSeverity { get; set; } = "INFO";
            public string? AssetSymbol { get; set; }
            public string? EventType { get; set; }
        }

        public class GetGlobalAlertsResponse
        {
            public List<GlobalAlertEventDto> Alerts { get; set; } = new();
            public int TotalCount { get; set; }
            public int Page { get; set; }
            public int PageSize { get; set; }
            public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
            public bool HasNextPage => Page < TotalPages;
            public bool HasPreviousPage => Page > 1;
        }

        public class MarkAlertViewedRequest
        {
            public string UserId { get; set; } = string.Empty;
            public long AlertEventId { get; set; }
            public string? DeviceType { get; set; }
        }

        public class UpdateNotificationPreferencesRequest
        {
            public string UserId { get; set; } = string.Empty;
            public bool EnableGlobalAlerts { get; set; } = true;
            public bool EnableWebPush { get; set; } = true;
            public bool EnableEmailDigest { get; set; } = false;
            public string EmailDigestFrequency { get; set; } = "DAILY";
            public string MinimumSeverity { get; set; } = "INFO";
            public List<string>? WatchedAssets { get; set; }
            public string? QuietHoursStart { get; set; }
            public string? QuietHoursEnd { get; set; }
        }
        public class GlobalAlertNotification
        {
            public long Id { get; set; }
            public string Type { get; set; } = "global_alert";
            public string AssetSymbol { get; set; } = string.Empty;
            public string Message { get; set; } = string.Empty;
            public string Severity { get; set; } = string.Empty;
            public string EventType { get; set; } = string.Empty;
            public decimal CurrentPrice { get; set; }
            public decimal? PercentChange { get; set; }
            public string? TimeWindow { get; set; }
            public DateTime Timestamp { get; set; }
        }

        public class GlobalAlertsStatistics
        {
            public int TotalAlertsToday { get; set; }
            public int TotalAlertsThisWeek { get; set; }
            public int CriticalAlertsToday { get; set; }
            public List<AssetAlertCount> TopAlertedAssets { get; set; } = new();
            public List<EventTypeCount> AlertsByType { get; set; } = new();
        }

        public class AssetAlertCount
        {
            public string AssetSymbol { get; set; } = string.Empty;
            public int Count { get; set; }
            public DateTime LastAlertAt { get; set; }
        }

        public class EventTypeCount
        {
            public string EventType { get; set; } = string.Empty;
            public int Count { get; set; }
        }
    }
}
