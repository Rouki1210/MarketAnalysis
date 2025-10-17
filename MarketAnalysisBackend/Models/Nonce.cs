using System.ComponentModel.DataAnnotations;

namespace MarketAnalysisBackend.Models
{
    public class Nonce
    {
        [Key]
        public int Id { get; set; }
        [Required, MaxLength(42)]
        public string WalletAddress { get; set; } = string.Empty;
        [Required]
        public string NonceValue { get; set; } = string.Empty;
        public DateTime CreateAt { get; set; }
        public DateTime ExpireAt { get; set; }
        public bool IsUsed { get; set; } = false;
    }
}
