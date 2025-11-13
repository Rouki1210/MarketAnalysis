using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketAnalysisBackend.Models.Community
{
    public class PostReaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PostId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required, MaxLength(20)]
        public string ReactionType { get; set; } = "like"; // like, love, insightful, etc.

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("PostId")]
        public virtual CommunityPost? Post { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}
