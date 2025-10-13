namespace MarketAnalysisBackend.Services.Interfaces
{
    public interface IAuthService
    {
        string HashPassword(string plainPassword, int workFactor = 10);
        bool VerifyPassword(string plainPassword, string hashedPassword);

        string GenerateRandomUsername(string prefix = "user");
    }
}
