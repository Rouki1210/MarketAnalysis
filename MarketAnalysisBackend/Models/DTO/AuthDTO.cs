namespace MarketAnalysisBackend.Models.DTO
{
    public class RegisterDTO
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
    public class LoginDTO
    {
        public string? UsernameOrEmail { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class GoogleLoginDTO
    {
        public string Code { get; set; } = string.Empty;
    }

    public class MetaMaskLoginDTO
    {
        public string WalletAddress { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class NonceRequestDTO
    {
        public string WalletAddress { get; set; } = string.Empty;
    }

    public class NonceResponseDTO
    {
        public string Nonce { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }

    public class AuthResponseDTO
    {
        public bool Success { get; set; }
        public string? Token { get; set; }
        public UserDTO User { get; set; }
        public string? Message { get; set; }
    }

    public class UserDTO
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? WalletAddress { get; set; }
        public string AuthType { get; set; } = string.Empty;
    }

    public class ChangePasswordDto 
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

}
