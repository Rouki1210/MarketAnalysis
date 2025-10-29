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
        public async Task<User?> GetUserByEmailorUsername(string emailorusername)
        {
            var user = await _userRepo.GetByEmailOrUsernameAsync(emailorusername);
            if (user == null)
            {
                throw new NotImplementedException();
            }
            return user;
        }

        public Task<User?> GetUserByWalletAddress(string? walletaddress)
        {
            if (!string.IsNullOrEmpty(walletaddress))
            {
                return _userRepo.GetByWalletAddressAsync(walletaddress);
            }
            return null;
        }
    }
}
