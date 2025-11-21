using MarketAnalysisBackend.Models.Alert;
using System.Linq.Expressions;

namespace MarketAnalysisBackend.Repositories.Interfaces
{
    public interface IUserAlertHistoryRepository : IGenericRepository<UserAlertHistories>
    {
        Task<IEnumerable<UserAlertHistories>> GetByAlertIdAsync(int alertId);
        Task<IEnumerable<UserAlertHistories>> GetByUserIdAsync(int userId, int limit = 50);
        Task<bool> IsOwnedByUserAsync(int historyId, int userId);

    }
}
