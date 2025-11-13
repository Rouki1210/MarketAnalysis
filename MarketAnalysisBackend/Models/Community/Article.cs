using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketAnalysisBackend.Models.Community
{
    public class Article
    {
        [Key]
        public int Id { get; set; }
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        [Required, MaxLength(500)]
        public string Summary { get; set; } = string.Empty;
        public string? Content { get; set; }
        [Required, MaxLength(50)]
        public string Category { get; set; } = string.Empty;
        public int? AuthorUserId { get; set; }
        [MaxLength(500)]
        public string? SourceUrl { get; set; }
        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public int ViewCount { get; set; } = 0;

        public bool IsPublished { get; set; } = true;

        public DateTime? PublishedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("AuthorUserId")]
        public virtual User? Author { get; set; }
    }
}
