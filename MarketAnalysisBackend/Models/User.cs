using System.ComponentModel.DataAnnotations;

namespace MarketAnalysisBackend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        [Required, MaxLength(100)]
        public string Username { get; set; } = string.Empty;
        [Required, MaxLength(200)]
        public string PasswordHash { get; set; } = string.Empty;
        [Required]
        public string Email { get; set; } = string.Empty;
        [MaxLength(200)]
        public string? WalletAddress { get; set; }
        [MaxLength(50)]
        public string AuthProvider { get; set; } = "Local"; // Local || Google || MetaMask || Other

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

    }
}
