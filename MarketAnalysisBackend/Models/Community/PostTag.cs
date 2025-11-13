using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketAnalysisBackend.Models.Community
{
    public class PostTag
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int PostId { get; set; }
        [Required, MaxLength(50)]
        public string TagName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [ForeignKey("PostId")]
        public virtual CommunityPost? Post { get; set; }
    }
}
