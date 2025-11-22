using Microsoft.Extensions.Caching.Memory;
using Supabase.Gotrue;

namespace MarketAnalysisBackend.Services
{
    public interface IActiveUserService
    {
        Task SetActiveUserAsync(int userId);
        int? GetActiveUser();
    }
    public class ActiveUserService : IActiveUserService
    {
        private readonly IMemoryCache _cache;
        private const string CacheKey = "ACTIVE_USER_ID";
        public ActiveUserService(IMemoryCache cache)
        {
            _cache = cache;
        }
        public int? GetActiveUser()
        {
            return _cache.TryGetValue(CacheKey, out int userId) ? userId : null;
        }

        public Task SetActiveUserAsync(int userId)
        {
            _cache.Set(CacheKey, userId, TimeSpan.FromHours(1));
            return Task.CompletedTask;
        }
    }
}
