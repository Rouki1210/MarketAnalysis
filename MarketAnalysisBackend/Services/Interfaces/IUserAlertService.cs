using MarketAnalysisBackend.Models.DTO;

namespace MarketAnalysisBackend.Services
{
    public interface IUserAlertService
    {
        Task<UserAlertResponseDto> CreateAlertAsync(int userId, CreateUserAlertDto dto);
        Task<UserAlertResponseDto?> GetAlertByIdAsync(int userId, int alertId);
        Task<List<UserAlertResponseDto>> GetUserAlertsAsync(int userId);
        Task<UserAlertResponseDto?> UpdateAlertAsync(int userId, int alertId, UpdateUserAlertDto dto);
        Task<bool> DeleteAlertAsync(int userId, int alertId);
        Task<List<UserAlertHistoryDto>> GetAlertHistoryAsync(int userId, int alertId);
        Task<List<UserAlertHistoryDto>> GetUserHistoryAsync(int userId, int limit = 50);
        Task<bool> DeleteAlertHistoryAsync(int userId, int historyId);
        Task CheckAndTriggerAlertsAsync();
    }
}
