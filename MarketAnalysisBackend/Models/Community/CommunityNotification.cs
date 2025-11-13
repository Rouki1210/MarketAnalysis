using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketAnalysisBackend.Models.Community
{
    public class CommunityNotification
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int UserId { get; set; }
        public int? ActorUserId { get; set; } // The user who triggered the notification
        [Required, MaxLength(50)]
        public string NotificationType { get; set; } = string.Empty; // like, comment, follow, mention, reply

        [Required, MaxLength(50)]
        public string EntityType { get; set; } = string.Empty; // post, comment

        public int EntityId { get; set; }

        [Required, MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("ActorUserId")]
        public virtual User? ActorUser { get; set; }
    }
}
