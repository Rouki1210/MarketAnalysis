namespace MarketAnalysisBackend.Models.DTO
{
    // Post DTOs
    public class CommunityPostDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public UserBasicDto Author { get; set; } = new();
        public int Likes { get; set; }
        public int Comments { get; set; }
        public int Bookmarks { get; set; }
        public int Shares { get; set; }
        public int ViewCount { get; set; }
        public bool IsPinned { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<string> Tags { get; set; } = new();
        public List<TopicBasicDto> Topics { get; set; } = new();
        public bool IsLiked { get; set; }
        public bool IsBookmarked { get; set; }
    }

    public class CreatePostDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public List<string>? Tags { get; set; }
        public List<int>? TopicIds { get; set; }
    }

    public class UpdatePostDto
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public List<string>? Tags { get; set; }
        public List<int>? TopicIds { get; set; }
    }

    // Comment DTOs
    public class CommentDto
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public UserBasicDto Author { get; set; } = new();
        public string Content { get; set; } = string.Empty;
        public int Likes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsLiked { get; set; }
        public List<CommentDto> Replies { get; set; } = new();
    }

    public class CreateCommentDto
    {
        public int PostId { get; set; }
        public string Content { get; set; } = string.Empty;
    }

    public class UpdateCommentDto
    {
        public string Content { get; set; } = string.Empty;
    }

    // User DTOs
    public class UserBasicDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? AvatarEmoji { get; set; }
        public bool IsVerified { get; set; }
    }

    public class UserFollowDto
    {
        public int Id { get; set; }
        public UserBasicDto User { get; set; } = new();
        public DateTime FollowedAt { get; set; }
    }

    public class FollowStatsDto
    {
        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
    }

    // Topic DTOs
    public class TopicDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int PostCount { get; set; }
        public int FollowerCount { get; set; }
        public bool IsFollowing { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class TopicBasicDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
    }

    public class CreateTopicDto
    {
        public string Name { get; set; } = string.Empty;
        public string Icon { get; set; } = "📌";
        public string? Description { get; set; }
    }

    public class UpdateTopicDto
    {
        public string? Name { get; set; }
        public string? Icon { get; set; }
        public string? Description { get; set; }
    }

    // Article DTOs
    public class ArticleDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string? Content { get; set; }
        public string Category { get; set; } = string.Empty;
        public UserBasicDto? Author { get; set; }
        public string? SourceUrl { get; set; }
        public string? ImageUrl { get; set; }
        public int ViewCount { get; set; }
        public bool IsPublished { get; set; }
        public DateTime? PublishedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateArticleDto
    {
        public string Title { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string? Content { get; set; }
        public string Category { get; set; } = "Education";
        public string? SourceUrl { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsPublished { get; set; } = true;
    }

    public class UpdateArticleDto
    {
        public string? Title { get; set; }
        public string? Summary { get; set; }
        public string? Content { get; set; }
        public string? Category { get; set; }
        public string? SourceUrl { get; set; }
        public string? ImageUrl { get; set; }
        public bool? IsPublished { get; set; }
    }

    // Notification DTOs
    public class NotificationDto
    {
        public int Id { get; set; }
        public UserBasicDto? ActorUser { get; set; }
        public string NotificationType { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public int EntityId { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // Reputation DTOs
    public class LeaderboardEntryDto
    {
        public int Rank { get; set; }
        public UserBasicDto User { get; set; } = new();
        public int Points { get; set; }
        public string Badge { get; set; } = string.Empty;
        public int PostCount { get; set; }
        public int CommentCount { get; set; }
        public int LikesReceived { get; set; }
    }
}