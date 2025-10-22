using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Interfaces;
using System.Security.Claims;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepo;
        public UserService(IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }
        public Task<User?> GetUserByEmailorUsername(string? emailorusername)
        {
            if (!string.IsNullOrEmpty(emailorusername))
            {
                return _userRepo.GetByEmailOrUsernameAsync(emailorusername);
            }
            return null;
        }
    }
}
