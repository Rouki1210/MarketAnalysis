using System.ComponentModel.DataAnnotations;

namespace MarketAnalysisBackend.Models
{
    public class UserRole
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; } 
        public int RoleId { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        public virtual User? User { get; set; }
        public virtual Role? Role { get; set; }
    }
}
