using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.Alert;
using MarketAnalysisBackend.Models.Community;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) 
            : base(options)
        {

        }
        public DbSet<Asset> Assets { get; set; }
        public DbSet<PricePoint> PricePoints { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Nonce> Nonces { get; set; }
        public DbSet<Watchlist> Watchlists { get; set; }
        public DbSet<WatchlistItems> WatchlistItems { get; set; }
        public DbSet<Global_metric> GlobalMetric { get; set; }
        public DbSet<GlobalAlertRule> GlobalAlertRules { get; set; }
        public DbSet<GlobalAlertEvent> GlobalAlertEvents { get; set; }
        public DbSet<UserAlertView> UserAlertView { get; set; }
        public DbSet<PriceCache> PriceCaches { get; set; }
        public DbSet<UserAlert> UserAlerts { get; set; }
        public DbSet<UserAlertHistories> UserAlertHistories { get; set; }

        //Community DbSets
        public DbSet<CommunityPost> CommunityPosts { get; set; }
        public DbSet<PostReaction> PostReactions { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<PostTag> PostTags { get; set; }
        public DbSet<PostBookmark> Bookmarks { get; set; }
        public DbSet<UserFollow> userFollows { get; set; }
        public DbSet<CommunityNotification> communityNotifications { get; set; }
        public DbSet<Article> Articles { get; set; }
        public DbSet<Topic> Topics { get; set; }
        public DbSet<PostTopic> PostTopics { get; set; }
        public DbSet<TopicFollow> TopicFollows { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Asset>()
                .HasIndex(a => a.Symbol)
                .IsUnique();
            modelBuilder.Entity<User>()
                .HasIndex(u => u.WalletAddress)
                .IsUnique();

            modelBuilder.Entity<Role>()
                .HasIndex(r => r.Name)
                .IsUnique();

            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.HasIndex(e => new { e.UserId, e.RoleId }).IsUnique();

                entity.HasOne(e => e.User)
                    .WithMany(u => u.UserRoles) 
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Role)
                    .WithMany(r => r.UserRoles) // Role có nhiều UserRoles
                    .HasForeignKey(e => e.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PricePoint>()
                .HasIndex(p => new { p.AssetId, p.TimestampUtc });

            modelBuilder.Entity<Nonce>()
                .HasIndex(n => n.WalletAddress);
            modelBuilder.Entity<Nonce>()
                .HasIndex(n => n.ExpireAt);
            modelBuilder.Entity<Global_metric>()
                .HasIndex(n => n.TimestampUtc);

            modelBuilder.Entity<GlobalAlertRule>(entity =>
            {
                entity.HasIndex(r => r.IsActive).HasFilter("\"IsActive\" = true");
                entity.HasIndex(e => new { e.RuleType, e.IsActive });
            });
            modelBuilder.Entity<GlobalAlertEvent>(entity =>
            {
                entity.HasIndex(e => new { e.AssetId, e.TriggeredAt }).IsDescending(false, true);
                entity.HasIndex(e => e.TriggeredAt).IsDescending();
                entity.HasIndex(e => new { e.RuleId, e.TriggeredAt }).IsDescending(false, true);
            });
            modelBuilder.Entity<UserAlertView>(entity =>
            {
                entity.HasIndex(e => new { e.UserId, e.AlertEventId }).IsUnique();
                entity.HasIndex(e => new { e.UserId, e.ViewedAt }).IsDescending(false, true);
            });
            modelBuilder.Entity<PriceCache>(entity =>
            {
                entity.HasIndex(e => e.AssetId).IsUnique();
            });

            modelBuilder.Entity<Watchlist>()
               .HasOne(w => w.User)
               .WithMany()
               .HasForeignKey(w => w.UserId);

            // Watchlist - WatchlistItem: One-to-Many
            modelBuilder.Entity<WatchlistItems>()
                .HasOne(wi => wi.Watchlist)
                .WithMany(w => w.WatchlistItems)
                .HasForeignKey(wi => wi.WatchlistId);

            // Asset - WatchlistItem: One-to-Many
            modelBuilder.Entity<WatchlistItems>()
                .HasOne(wi => wi.Asset)
                .WithMany()
                .HasForeignKey(wi => wi.AssetId);

            // Unique: Một Asset không thể trùng trong cùng một Watchlist
            modelBuilder.Entity<WatchlistItems>()
                .HasIndex(wi => new { wi.WatchlistId, wi.AssetId })
                .IsUnique();

            modelBuilder.Entity<UserAlert>(entity =>
            {
                entity.HasIndex(e => new { e.UserId, e.IsActive });
                entity.HasIndex(e => new { e.AssetId, e.IsActive });
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => new { e.UserId, e.AssetId, e.AlertType });

                entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Asset).WithMany().HasForeignKey(e => e.AssetId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<UserAlertHistories>(entity =>
            {
                entity.HasIndex(e => e.UserAlertId);
                entity.HasIndex(e => new { e.UserId, e.TriggeredAt }).IsDescending(false, true);
                entity.HasIndex(e => new { e.AssetId, e.TriggeredAt }).IsDescending(false, true);
                entity.HasIndex(e => e.TriggeredAt).IsDescending();
                entity.HasIndex(e => new { e.UserId, e.ViewAt });

                entity.HasOne(e => e.UserAlert).WithMany(a => a.History).HasForeignKey(e => e.UserAlertId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Asset).WithMany().HasForeignKey(e => e.AssetId).OnDelete(DeleteBehavior.Restrict);
            });

            // CommunityPost configurations
            modelBuilder.Entity<CommunityPost>(entity =>
            {
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.IsPublished);

                entity.HasQueryFilter(e => e.DeletedAt == null);

                entity.HasOne(e => e.User)
                    .WithMany(u => u.Posts)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // PostReaction configurations
            modelBuilder.Entity<PostReaction>(entity =>
            {
                entity.HasIndex(e => e.PostId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => new { e.PostId, e.UserId, e.ReactionType })
                    .IsUnique();

                entity.HasOne(e => e.Post)
                    .WithMany(p => p.Reactions)
                    .HasForeignKey(e => e.PostId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                    .WithMany(u => u.Reactions)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // PostBookmark configurations
            modelBuilder.Entity<PostBookmark>(entity =>
            {
                entity.HasIndex(e => e.PostId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => new { e.PostId, e.UserId })
                    .IsUnique();

                entity.HasOne(e => e.Post)
                    .WithMany(p => p.Bookmarks)
                    .HasForeignKey(e => e.PostId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                    .WithMany(u => u.Bookmarks)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Comment configurations
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.HasIndex(e => e.PostId);
                entity.HasIndex(e => e.UserId);


                entity.HasQueryFilter(e => e.DeletedAt == null); // Global query filter for soft delete

                entity.HasOne(e => e.Post)
                    .WithMany(p => p.Comments)
                    .HasForeignKey(e => e.PostId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                    .WithMany(u => u.Comments)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // UserFollow configurations
            modelBuilder.Entity<UserFollow>(entity =>
            {
                entity.HasIndex(e => e.FollowerId);
                entity.HasIndex(e => e.FollowingId);
                entity.HasIndex(e => new { e.FollowerId, e.FollowingId })
                    .IsUnique();

                entity.HasOne(e => e.Follower)
                    .WithMany(u => u.Following)
                    .HasForeignKey(e => e.FollowerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Following)
                    .WithMany(u => u.Followers)
                    .HasForeignKey(e => e.FollowingId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Prevent self-follow
                entity.HasCheckConstraint("CK_UserFollow_NoSelfFollow", "\"FollowerId\" != \"FollowingId\"");
            });

            // CommunityNotification configurations
            modelBuilder.Entity<CommunityNotification>(entity =>
            {
                entity.HasIndex(e => new { e.UserId, e.IsRead });
                entity.HasIndex(e => e.CreatedAt);

                entity.HasOne(e => e.User)
                    .WithMany(u => u.Notifications)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.ActorUser)
                    .WithMany()
                    .HasForeignKey(e => e.ActorUserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Article configurations
            modelBuilder.Entity<Article>(entity =>
            {
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.IsPublished); // Remove the filter
                entity.HasIndex(e => e.PublishedAt);

                entity.HasOne(e => e.Author)
                    .WithMany(u => u.Articles)
                    .HasForeignKey(e => e.AuthorUserId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Topic configurations
            modelBuilder.Entity<Topic>(entity =>
            {
                entity.HasIndex(e => e.Name)
                    .IsUnique();
                entity.HasIndex(e => e.Slug)
                    .IsUnique();
            });

            // PostTopic configurations
            modelBuilder.Entity<PostTopic>(entity =>
            {
                entity.HasIndex(e => e.PostId);
                entity.HasIndex(e => e.TopicId);
                entity.HasIndex(e => new { e.PostId, e.TopicId })
                    .IsUnique();

                entity.HasOne(e => e.Post)
                    .WithMany(p => p.Topics)
                    .HasForeignKey(e => e.PostId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Topic)
                    .WithMany(t => t.PostTopics)
                    .HasForeignKey(e => e.TopicId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // TopicFollow configurations
            modelBuilder.Entity<TopicFollow>(entity =>
            {
                entity.HasIndex(e => e.TopicId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => new { e.TopicId, e.UserId })
                    .IsUnique();

                entity.HasOne(e => e.Topic)
                    .WithMany(t => t.TopicFollows)
                    .HasForeignKey(e => e.TopicId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                    .WithMany(u => u.TopicFollows)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // PostTag configurations
            modelBuilder.Entity<PostTag>(entity =>
            {
                entity.HasIndex(e => e.PostId);
                entity.HasIndex(e => e.TagName);

                entity.HasOne(e => e.Post)
                    .WithMany(p => p.Tags)
                    .HasForeignKey(e => e.PostId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }

    }
}
