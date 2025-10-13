using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Interfaces;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IAuthService _authService;
        public UserService(IUserRepository userRepository, IAuthService authService)
        {
            _userRepository = userRepository;
            _authService = authService;
        }

        public bool Login(string userName, string password)
        {
            var user = _userRepository.GetByUsername(userName);
            if (user == null) return false;
            return _authService.VerifyPassword(password, user.PasswordHash);
        }

        public User Register(string email, string? username, string plainPassword)
        {
            if (_userRepository.GetByEmail(email) != null)
                throw new Exception("Email already registered.");

            string generatedUsername;
            int attempts = 0;
            do
            {
                generatedUsername = _authService.GenerateRandomUsername();
                attempts++;
                if (attempts > 10) throw new Exception("Cannot generate unique username.");
            }
            while (_userRepository.GetByUsername(generatedUsername) != null);

            var user = new User
            {
                Email = email,
                Username = generatedUsername,
                PasswordHash = _authService.HashPassword(plainPassword)
            };
            _userRepository.Add(user);
            return user;
        }
    }
}
