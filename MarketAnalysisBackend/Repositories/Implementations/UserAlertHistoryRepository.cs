using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models.Alert;
using MarketAnalysisBackend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Asn1;
using System;
using System.Linq.Expressions;

namespace MarketAnalysisBackend.Repositories.Implementations
{
    public class UserAlertHistoryRepository : GenericRepository<UserAlertHistories>, IUserAlertHistoryRepository
    {
        private readonly AppDbContext _context;
        public UserAlertHistoryRepository(AppDbContext context) : base(context) 
        {
            _context = context;
        }

        public async Task<IEnumerable<UserAlertHistories>> GetByAlertIdAsync(int alertId)
        {
            return await _context.UserAlertHistories
                .Include(h => h.Asset)
                .Where(h => h.UserAlertId == alertId)
                .OrderByDescending(h => h.TriggeredAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserAlertHistories>> GetByUserIdAsync(int userId, int limit = 50)
        {
            return await _context.UserAlertHistories
                .Include(h => h.Asset)
                .Where(h => h.UserId == userId)
                .OrderByDescending(h => h.TriggeredAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<bool> IsOwnedByUserAsync(int historyId, int userId)
        {
            return await _context.UserRoles.AnyAsync(h => h.Id == historyId && h.UserId == userId);
        }
    }
}
