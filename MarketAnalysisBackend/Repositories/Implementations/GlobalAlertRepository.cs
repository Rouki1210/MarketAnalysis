using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models.Alert;
using MarketAnalysisBackend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations
{
    public class GlobalAlertRepository : IGlobalAlertRepository
    {
        private readonly AppDbContext _context;
        public GlobalAlertRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<GlobalAlertEvent> CreateEventAsync(GlobalAlertEvent alertEvent, CancellationToken cancellationToken = default)
        {
            _context.GlobalAlertEvents.Add(alertEvent);
            await _context.SaveChangesAsync(cancellationToken);

            return alertEvent;
        }

        public async Task<IEnumerable<GlobalAlertRule>> GetActiveRulesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.GlobalAlertRules
                .Where(r => r.IsActive)
                .Include(r => r.Asset)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<int> GetAlertCountAsync(DateTime since, CancellationToken cancellationToken = default)
        {
            return await _context.GlobalAlertEvents
                .CountAsync(e => e.TriggeredAt >= since, cancellationToken);
        }

        public async Task<GlobalAlertEvent?> GetLastAlertByRuleAndAssetAsync(int ruleId, int assetId, DateTime since, CancellationToken cancellationToken = default)
        {
            return await _context.GlobalAlertEvents.Where(e => e.RuleId == ruleId && e.AssetId == assetId && e.TriggeredAt >= since)
                .OrderByDescending(e => e.TriggeredAt)
                .AsNoTracking()
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<IEnumerable<GlobalAlertEvent>> GetRecentEventsAsync(DateTime since, CancellationToken cancellationToken = default)
        {
            return await _context.GlobalAlertEvents
                .Where(e => e.TriggeredAt >= since)
                .Include(e => e.Asset)
                .Include(e => e.Rule)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<GlobalAlertRule?> GetRuleByIdAsync(int ruleId, CancellationToken cancellationToken = default)
        {
            return await _context.GlobalAlertRules
                .Include(r => r.Asset)
                .FirstOrDefaultAsync(r => r.Id == ruleId, cancellationToken);
        }

        public async Task<bool> HasUserViewedAlertAsync(string userId, int alertEventId, CancellationToken cancellationToken = default)
        {
            return await _context.UserAlertView.AnyAsync(v => v.UserId == userId && v.AlertEventId == alertEventId, cancellationToken);
        }

        public async Task MarkAlertAsViewedAsync(string userId, int alertEventId, string? deviceType = null, CancellationToken cancellationToken = default)
        {
            var exists = await HasUserViewedAlertAsync(userId, alertEventId, cancellationToken);
            if (!exists)
            {
                var view = new UserAlertView
                {
                    UserId = userId,
                    AlertEventId = alertEventId,
                    ViewedAt = DateTime.UtcNow,
                };
                _context.UserAlertView.Add(view);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        public async Task UpdateEventStatusAsync(int eventId, string status, int notificationCount, CancellationToken cancellationToken = default)
        {
            var alertEvent = await _context.GlobalAlertEvents.FindAsync(new object[] { eventId }, cancellationToken);
            if (alertEvent != null)
            {
                alertEvent.NotificationStatus = status;
                alertEvent.NotificationsSent = notificationCount;
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}
