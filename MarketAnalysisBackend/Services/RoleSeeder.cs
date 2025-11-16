using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Services
{
    public class RoleSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.Roles.AnyAsync())
            {
                return;
            }

            var roles = new List<Role>
            {
                new Role
                {
                    Name = "Admin",
                    Description = "Full system access",
                },
                new Role
                {
                    Name = "Moderator",
                    Description = "Can moderate content",
                },
                new Role
                {
                    Name = "User",
                    Description = "Standard user",
                },
                new Role
                {
                    Name = "Premium",
                    Description = "Premium user with extra features",
                }
            };

            context.Roles.AddRange(roles);
            await context.SaveChangesAsync();
        }
    }
}
