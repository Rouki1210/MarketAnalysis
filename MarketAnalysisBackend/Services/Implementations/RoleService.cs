using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace MarketAnalysisBackend.Services.Implementations
{
    public interface IRoleService
    {
        Task<List<string>> GetUserRoleAsync(int userId);
        Task<bool> HasRoleAsync(int userId, string roleName);
        Task<bool> AssignRoleAsync(int userId, string roleName);
        Task<bool> RemoveRoleAsync(int userId, string roleName);
        Task<List<Role>> GetAllRolesAsync();
        Task<Role?> GetRoleByIdAsync(int roleId);
        Task<Role?> GetRoleByNameAsync(string roleName);
    }
    public class RoleService : IRoleService
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly ILogger<RoleService> _logger;
        public RoleService(AppDbContext context, ILogger<RoleService> logger, IMemoryCache cache)
        {
            _context = context;
            _logger = logger;
            _cache = cache;
        }
        public async Task<bool> AssignRoleAsync(int userId, string roleName)
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
            if (role == null)
            {
                _logger.LogWarning("Role {RoleName} not found", roleName);
                return false;
            }
            var exists = await _context.UserRoles.AnyAsync(u => u.UserId == userId && u.RoleId == role.Id);
            if (exists)
            {
                _logger.LogWarning(" User {UserId} already has role {RoleName}", userId, roleName);
                return false;
            }

            var userRole = new UserRole
            {
                UserId = userId,
                RoleId = role.Id,
                AssignedAt = DateTime.UtcNow
            };

            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            _cache.Remove($"UserRoles_{userId}");
            _logger.LogInformation("Assigned role {RoleName} to user {UserId}", roleName, userId);
            return true;
        }

        public async Task<List<Role>> GetAllRolesAsync()
        {
            return await _context.Roles.OrderBy(r => r.Name).ToListAsync();
        }

        public async Task<Role?> GetRoleByIdAsync(int roleId)
        {
            return await _context.Roles.Include(r => r.UserRoles)
                .FirstOrDefaultAsync(r => r.Id == roleId);
        }

        public async Task<Role?> GetRoleByNameAsync(string roleName)
        {
            return await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
        }

        public async Task<List<string>> GetUserRoleAsync(int userId)
        {
            var cacheKey = $"UserRoles_{userId}";
            if (_cache.TryGetValue(cacheKey, out List<string>? roles))
            {
                _logger.LogInformation("Cache miss - Query roles for user {UserId}", userId);

                roles = await _context.UserRoles
                    .Where(u => u.UserId == userId)
                    .Include(u => u.Role)
                    .Select(u => u.Role!.Name)
                    .ToListAsync();

                var cacheOptions = new MemoryCacheEntryOptions()
                   .SetAbsoluteExpiration(TimeSpan.FromMinutes(15));

                _cache.Set(cacheKey, roles, cacheOptions);

                _logger.LogInformation(" Cached roles for user {UserId}: {Roles}",
                    userId, string.Join(", ", roles));
            }
            else
            {
                _logger.LogInformation("Cache hit - Retrieved roles for user {UserId} from cache", userId);
            }

                return roles ?? new List<string>();
        }

        public async Task<bool> HasRoleAsync(int userId, string roleName)
        {
            var roles = await GetUserRoleAsync(userId);

            return roles.Contains(roleName, StringComparer.OrdinalIgnoreCase);
        }

        public async Task<bool> RemoveRoleAsync(int userId, string roleName)
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
            if (role == null)
            {
                _logger.LogWarning("Role {RoleName} not found", roleName);
                return false;
            }
            var userRole = await _context.UserRoles
                .FirstOrDefaultAsync(u => u.UserId == userId && u.RoleId == role.Id);
            if (userRole == null)
            {
                _logger.LogWarning("⚠️ User {UserId} does not have role {RoleName}", userId, roleName);
                return false;
            }

            _context.UserRoles.Remove(userRole);
            await _context.SaveChangesAsync();

            _cache.Remove($"UserRoles_{userId}");
            _logger.LogInformation("Removed role {RoleName} from user {UserId}", roleName, userId);
            return true;
        }
    }
}
