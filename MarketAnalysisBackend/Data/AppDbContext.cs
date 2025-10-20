using MarketAnalysisBackend.Models;
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
        }

    }
}
