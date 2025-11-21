using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models.Alert;
using MarketAnalysisBackend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Asn1;
using System.Linq.Expressions;

namespace MarketAnalysisBackend.Repositories.Implementations
{
    public class UserAlertRepository : GenericRepository<UserAlert>, IUserAlertRepository
    {
        private readonly AppDbContext _context;
        public UserAlertRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<int> CountByUserIdAsync(int userId)
        {
            return await _context.UserAlerts.CountAsync(a => a.UserId == userId);
        }

        public async Task<IEnumerable<UserAlert>> GetActiveAlertsAsync()
        {
            return await _context.UserAlerts
                .Include(a => a.Asset)
                .Where(a => a.IsActive)
                .ToListAsync();
        }

        public async Task<UserAlert?> GetByIdWithAssetAsync(int id)
        {
            return await _context.UserAlerts
                .Include(a => a.Asset)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<UserAlert>> GetByUserIdAsync(int userId)
        {
            return await _context.UserAlerts
                .Include(a => a.Asset)
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public Task<bool> IsOwnedByUserAsync(int alertId, int userId)
        {
            return _context.UserAlerts.AnyAsync(a => a.Id == alertId && a.UserId == userId);
        }
    }
}
