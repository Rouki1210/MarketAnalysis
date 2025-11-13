using Org.BouncyCastle.Asn1.Cms.Ecc;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MarketAnalysisBackend.Models.Community
{
    public class CommunityPost
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required, MaxLength(200)]
        public string Title { get; set; }
        [Required]
        public string Content { get; set; }
        public int ViewCount { get; set; } = 0;
        public bool IsPublished { get; set; } = true;
        public bool IsPinned { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DeletedAt { get; set; }
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
        public virtual ICollection<PostTag> Tags { get; set; } = new List<PostTag>();
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection <PostTopic> Topics { get; set; } = new List<PostTopic>();
        public virtual ICollection<PostBookmark> Bookmarks { get; set; } = new List<PostBookmark>();
        public virtual ICollection <PostReaction> Reactions { get; set; } = new List<PostReaction>();

        [NotMapped]
        public int LikeCount => Reactions.Count(r => r.ReactionType == "like");
        [NotMapped]
        public int CommentCount => Comments?.Count ?? 0;
        [NotMapped]
        public int BookmarksCount => Bookmarks?.Count ?? 0;
    }
}
