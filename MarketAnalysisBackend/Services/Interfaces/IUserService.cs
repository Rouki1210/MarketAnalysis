using MarketAnalysisBackend.Models;

namespace MarketAnalysisBackend.Services.Interfaces
{
    public interface IUserService
    {
        User Register(string email, string? username, string plainPassword);
        bool Login(string userName, string password);
    }
}
