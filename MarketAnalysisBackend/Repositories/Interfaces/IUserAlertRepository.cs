using MarketAnalysisBackend.Models.Alert;
using System.Linq.Expressions;

namespace MarketAnalysisBackend.Repositories.Interfaces
{
    public interface IUserAlertRepository : IGenericRepository<UserAlert>
    {
        Task<IEnumerable<UserAlert>> GetByUserIdAsync(int userId);
        Task<UserAlert?> GetByIdWithAssetAsync(int id);
        Task<IEnumerable<UserAlert>> GetActiveAlertsAsync();
        Task<bool> IsOwnedByUserAsync(int alertId, int userId);
        Task<int> CountByUserIdAsync(int userId);
    }
}
