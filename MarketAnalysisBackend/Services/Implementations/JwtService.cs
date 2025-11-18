using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<JwtService> _logger;

        public JwtService(IConfiguration config, ILogger<JwtService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public string GenerateToken(User user)
        {
            // Validate configuration
            var jwtKey = _config["Jwt:Key"];
            var jwtIssuer = _config["Jwt:Issuer"];
            var jwtAudience = _config["Jwt:Audience"];
            var jwtExpireMinutes = _config["Jwt:ExpireMinutes"];

            if (string.IsNullOrEmpty(jwtKey))
                throw new InvalidOperationException("JWT Key is not configured in appsettings.json");

            if (jwtKey.Length < 32)
                throw new InvalidOperationException("JWT Key must be at least 32 characters long");

            if (string.IsNullOrEmpty(jwtIssuer))
                throw new InvalidOperationException("JWT Issuer is not configured");

            if (string.IsNullOrEmpty(jwtAudience))
                throw new InvalidOperationException("JWT Audience is not configured");

            // Build claims
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Unique token ID
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("username", user.Username),
                new Claim("displayName", user.DisplayName ?? user.Username),
                new Claim("authProvider", user.AuthProvider)
            };

            // Create signing credentials
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Set expiration
            var expireMinutes = string.IsNullOrEmpty(jwtExpireMinutes)
                ? 60
                : Convert.ToDouble(jwtExpireMinutes);
            var now = DateTime.UtcNow;
            var expires = now.AddMinutes(expireMinutes);

            // Create token
            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                notBefore: now,
                expires: expires,
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            _logger.LogInformation(
                "Generated JWT token for user {UserId} ({Username}). Issuer: {Issuer}, Audience: {Audience}, Expires: {Expires}",
                user.Id, user.Username, jwtIssuer, jwtAudience, expires);

            return tokenString;
        }

        public ClaimsPrincipal? GetPrincipalFromToken(string token)
        {
            // This method is used to extract claims from token without full validation
            // Should NOT be used for authentication - use middleware instead
            var jwtKey = _config["Jwt:Key"];
            var jwtIssuer = _config["Jwt:Issuer"];
            var jwtAudience = _config["Jwt:Audience"];

            if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
            {
                _logger.LogError("JWT configuration is missing");
                return null;
            }

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = false, // Allow reading expired tokens for info extraction only
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            try
            {
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken validatedToken);

                _logger.LogDebug("Successfully extracted claims from token");
                return principal;
            }
            catch (SecurityTokenExpiredException ex)
            {
                _logger.LogWarning("Token has expired: {Message}", ex.Message);
                return null;
            }
            catch (SecurityTokenInvalidSignatureException ex)
            {
                _logger.LogError("Invalid token signature: {Message}", ex.Message);
                return null;
            }
            catch (SecurityTokenInvalidIssuerException ex)
            {
                _logger.LogError("Invalid token issuer: {Message}", ex.Message);
                return null;
            }
            catch (SecurityTokenInvalidAudienceException ex)
            {
                _logger.LogError("Invalid token audience: {Message}", ex.Message);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Token validation failed: {Message}", ex.Message);
                return null;
            }
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var generator = RandomNumberGenerator.Create())
            {
                generator.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }
    }
}
