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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Asset>()
                .HasIndex(a => a.Symbol)
            .IsUnique();

            modelBuilder.Entity<PricePoint>()
                .HasIndex(p => new { p.AssetId, p.TimestampUtc });
        }

    }
}
