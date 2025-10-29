using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.Alert;
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
        public DbSet<Nonce> Nonces { get; set; }
        public DbSet<Global_metric> GlobalMetric { get; set; }
        public DbSet<GlobalAlertRule> GlobalAlertRules { get; set; }
        public DbSet<GlobalAlertEvent> GlobalAlertEvents { get; set; }
        public DbSet<UserAlertView> UserAlertView { get; set; }
        public DbSet<PriceCache> PriceCaches { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Asset>()
                .HasIndex(a => a.Symbol)
                .IsUnique();
            modelBuilder.Entity<User>()
                .HasIndex(u => u.WalletAddress)
                .IsUnique();

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
        }

    }
}
