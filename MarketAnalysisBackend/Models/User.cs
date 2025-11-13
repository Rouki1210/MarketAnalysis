using MarketAnalysisBackend.Models.Community;
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
        public string? AvartarUrl { get; set; }
        [MaxLength(200)]
        public string? WalletAddress { get; set; }
        [MaxLength(50)]
        public string AuthProvider { get; set; } = "Local"; // Local || Google || MetaMask || Other
        public string? ProfilePictureUrl { get; set; }
        public int FollowerCount { get; set; } = 0;
        public int FollowingCount { get; set; } = 0;
        public bool IsVerified { get; set; } = false;
        [MaxLength(250)]
        public string? Bio { get; set; }
        public string? Website { get; set; }
        public DateTime Brithday { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public virtual ICollection<Watchlist> Watchlists { get; set; } = new List<Watchlist>();
        public virtual ICollection<CommunityPost> Posts { get; set; } = new List<CommunityPost>();
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<PostReaction> Reactions { get; set; } = new List<PostReaction>();
        public virtual ICollection<PostBookmark> Bookmarks { get; set; } = new List<PostBookmark>();
        public virtual ICollection<UserFollow> Followers { get; set; } = new List<UserFollow>();
        public virtual ICollection<UserFollow> Following { get; set; } = new List<UserFollow>();
        public virtual ICollection<CommunityNotification> Notifications { get; set; } = new List<CommunityNotification>();
        public virtual ICollection<Article> Articles { get; set; } = new List<Article>();
        public virtual ICollection<TopicFollow> TopicFollows { get; set; } = new List<TopicFollow>();

    }
}
