using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Services.Interfaces;
using Nethereum.Signer;
using System.Text.RegularExpressions;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class WalletService : IWalletService
    {
        private readonly ILogger<WalletService> _logger;
        public WalletService(ILogger<WalletService> logger)
        {
            _logger = logger;
        }
        public string GenerateNonceMessage(string walletAddress, string nonce)
        {
            return $@"Sign this message to authenticate with MarketAnalysis.

                Wallet: {walletAddress}
                Nonce: {nonce}
                Timestamp: {DateTime.UtcNow:O}

                This request will not trigger a blockchain transaction or cost any gas fees.";
        }

        public bool IsValidWalletAddress(string address)
        {
            if (string.IsNullOrEmpty(address))
                return false;
            if (!address.StartsWith("0x"))
                return false;
            if (address.Length != 42)
                return false;

            return Regex.IsMatch(address.Substring(2), "^[0-9a-fA-F]{40}$");
        }

        public async Task<bool> VerifySignatureAsync(string message, string signature, string expectedAddress)
        {
            try
            {
                var signer = new EthereumMessageSigner();
                var recoveredAddress = signer.EncodeUTF8AndEcRecover(message, signature);
                var isValid = recoveredAddress.Equals(expectedAddress, StringComparison.OrdinalIgnoreCase);

                 _logger.LogInformation(
                    $"Signature verification: Expected={expectedAddress}, Recovered={recoveredAddress}, Valid={isValid}");

                return  isValid;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying signature");
                return false;
            }
        }
    }
}
