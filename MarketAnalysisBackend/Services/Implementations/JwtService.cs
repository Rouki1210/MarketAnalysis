using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;
using Supabase.Gotrue;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace MarketAnalysisBackend.Services.Implementations
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _config;
        private readonly IRoleService _roleService;
        private readonly ILogger<JwtService> _logger;
        public JwtService(IConfiguration config, IRoleService roleService, ILogger<JwtService> logger)
        {
            _config = config;
            _roleService = roleService;
            _logger = logger;
        }

        public async Task<string> GenerateToken(Models.User user)
        {
            var jwtKey = _config["Jwt:Key"];
            var jwtIssuer = _config["Jwt:Issuer"];
            var jwtAudience = _config["Jwt:Audience"];
            var jwtExpireMinutes = _config["Jwt:ExpireInMinutes"];

            if (string.IsNullOrEmpty(jwtKey))
                throw new InvalidOperationException("JWT Key is not configured in appsettings.json");

            if (jwtKey.Length < 32)
                throw new InvalidOperationException("JWT Key must be at least 32 characters long");

            if (string.IsNullOrEmpty(jwtIssuer))
                throw new InvalidOperationException("JWT Issuer is not configured");

            if (string.IsNullOrEmpty(jwtAudience))
                throw new InvalidOperationException("JWT Audience is not configured");

            _logger.LogInformation("=== GENERATING TOKEN ===");
            _logger.LogInformation("User ID: {UserId}", user.Id);
            _logger.LogInformation("Username: {Username}", user.Username);
            _logger.LogInformation("Email: {Email}", user.Email);

            var roles = await _roleService.GetUserRoleAsync(user.Id);
            _logger.LogInformation("User Roles: {Roles}", string.Join(", ", roles));

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),

                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),

                new Claim("username", user.Username),
                new Claim("displayName", user.DisplayName ?? user.Username),
                new Claim("authProvider", user.AuthProvider)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
                _logger.LogInformation("Added role claim: {Role}", role);
            }

            _logger.LogInformation("Total claims: {Count}", claims.Count);

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expireMinutes = string.IsNullOrEmpty(jwtExpireMinutes)
                ? 60
                : Convert.ToDouble(jwtExpireMinutes);

            var now = DateTime.UtcNow;
            var expires = now.AddMinutes(expireMinutes);

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                notBefore: now,
                expires: expires,
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            _logger.LogInformation("✅ Token generated successfully");
            _logger.LogInformation("Issued at: {IssuedAt}", now);
            _logger.LogInformation("Expires at: {ExpiresAt}", expires);
            _logger.LogInformation("Token length: {Length}", tokenString.Length);
            _logger.LogInformation("=======================");

            return tokenString;
        }

        public ClaimsPrincipal? GetPrincipalFromToken(string token)
        {
            var jwtKey = _config["Jwt:Key"];
            var jwtIssuer = _config["Jwt:Issuer"];
            var jwtAudience = _config["Jwt:Audience"];

            if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
            {
                _logger.LogError("JWT configuration is incomplete");
                return null;
            }

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = false, 
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken validatedToken);
                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                _logger.LogInformation("✅ Token validated successfully for user: {UserId}", userId);
                return principal;
            }
            catch (SecurityTokenExpiredException ex)
            {
                _logger.LogWarning("Token has expired: {Message}", ex.Message);
                return null;
            }
            catch (SecurityTokenInvalidSignatureException ex)
            {
                _logger.LogWarning("Invalid token signature: {Message}", ex.Message);
                return null;
            }
            catch (SecurityTokenInvalidIssuerException ex)
            {
                _logger.LogWarning("Invalid issuer: {Message}", ex.Message);
                return null;
            }
            catch (SecurityTokenInvalidAudienceException ex)
            {
                _logger.LogWarning("Invalid audience: {Message}", ex.Message);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating token");
                return null;
            }
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var generator = RandomNumberGenerator.Create())
            {
                generator.GetBytes(randomNumber);
                var refreshToken = Convert.ToBase64String(randomNumber);
                return refreshToken;
            }
        }

    }
}
