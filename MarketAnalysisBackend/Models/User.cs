using System.ComponentModel.DataAnnotations;

namespace MarketAnalysisBackend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        [Required, MaxLength(100)]
        public string Username { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        [Required, MaxLength(200)]
        public string PasswordHash { get; set; } = string.Empty;
        [Required]
        public string Email { get; set; } = string.Empty;
        [MaxLength(200)]
        public string? WalletAddress { get; set; }
        [MaxLength(50)]
        public string AuthProvider { get; set; } = "Local"; // Local || Google || MetaMask || Other
        [MaxLength(250)]
        public string? Bio { get; set; }
        public string? Website { get; set; }
        public DateTime Brithday { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public virtual ICollection<Watchlist> Watchlists { get; set; } = new List<Watchlist>();

    }
}
