using System.ComponentModel.DataAnnotations;

namespace MarketAnalysisBackend.Models.Community
{
    public class Topic
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Slug { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Icon { get; set; } = "📌"; // Emoji or icon identifier

        [MaxLength(500)]
        public string? Description { get; set; }

        public int PostCount { get; set; } = 0;

        public int FollowerCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<PostTopic> PostTopics { get; set; } = new List<PostTopic>();
        public virtual ICollection<TopicFollow> TopicFollows { get; set; } = new List<TopicFollow>();
    }
}
