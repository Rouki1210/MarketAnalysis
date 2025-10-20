namespace MarketAnalysisBackend.Services.Interfaces
{
    public interface IWalletService
    {
        bool IsValidWalletAddress(string address);
        Task<bool> VerifySignatureAsync(string message, string signature, string expectedAddress);
        string GenerateNonceMessage(string walletAddress, string nonce);
    }
}
