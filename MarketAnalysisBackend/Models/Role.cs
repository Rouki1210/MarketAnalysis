using System.ComponentModel.DataAnnotations;

namespace MarketAnalysisBackend.Models
{
    public class Role
    {
        [Key]
        public int Id { get; set; }
        [Required, MaxLength(50)]
        public string Name { get; set; } = string.Empty;
        [Required, MaxLength(50)]
        public string Description { get; set; } = string.Empty;
        public DateTime CreateAt { get; set; } = DateTime.UtcNow;
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }
}
