using System.ComponentModel.DataAnnotations;

namespace MarketAnalysisBackend.Models.DTO
{

    /// <summary>
    /// DTO for creating a new user alert
    /// </summary>
    public class CreateUserAlertDto
    {
        [Required(ErrorMessage = "Asset ID is required")]
        public int AssetId { get; set; }

        [Required(ErrorMessage = "Alert type is required")]
        [RegularExpression("^(REACHES|ABOVE|BELOW)$", ErrorMessage = "Alert type must be REACHES, ABOVE, or BELOW")]
        public string AlertType { get; set; } = string.Empty;

        [Required(ErrorMessage = "Target price is required")]
        [Range(0.00000001, double.MaxValue, ErrorMessage = "Target price must be greater than 0")]
        public decimal TargetPrice { get; set; }

        public bool IsRepeating { get; set; } = false;

        [MaxLength(40, ErrorMessage = "Note cannot exceed 40 characters")]
        public string? Note { get; set; }
    }

    /// <summary>
    /// DTO for updating an existing alert
    /// </summary>
    public class UpdateUserAlertDto
    {
        [Range(0.00000001, double.MaxValue, ErrorMessage = "Target price must be greater than 0")]
        public decimal? TargetPrice { get; set; }

        public bool? IsRepeating { get; set; }

        public bool? IsActive { get; set; }

        [MaxLength(40, ErrorMessage = "Note cannot exceed 40 characters")]
        public string? Note { get; set; }
    }

    /// <summary>
    /// DTO for alert response
    /// </summary>
    public class UserAlertResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int AssetId { get; set; }
        public string AssetSymbol { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public string AlertType { get; set; } = string.Empty;
        public decimal TargetPrice { get; set; }
        public bool IsRepeating { get; set; }
        public string? Note { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastTriggeredAt { get; set; }
        public int TriggerCount { get; set; }
    }

    /// <summary>
    /// DTO for alert history record
    /// </summary>
    public class UserAlertHistoryDto
    {
        public int Id { get; set; }
        public int UserAlertId { get; set; }
        public string AssetSymbol { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public string AlertType { get; set; } = string.Empty;
        public decimal TargetPrice { get; set; }
        public decimal ActualPrice { get; set; }
        public DateTime TriggeredAt { get; set; }
        public bool WasNotified { get; set; }
        public DateTime? ViewedAt { get; set; }
    }
}