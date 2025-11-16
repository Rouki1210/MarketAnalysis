using Google.Apis.Auth;
using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Implementations;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IJwtService _jwtService;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _config;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<AuthController> _logger;
        public AuthController(
            IAuthService userService,
            IJwtService jwtService,
            IHttpClientFactory httpClientFactory,
            IConfiguration config,
            IUserRepository userRepository,
            ILogger<AuthController> logger
            )
        {
            _authService = userService;
            _jwtService = jwtService;
            _httpClientFactory = httpClientFactory;
            _config = config;
            _userRepository = userRepository;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
        {
            var user = await _authService.RegisterAsync(dto);
            var token = _jwtService.GenerateToken(user);
            return Ok(new { success = true, user.Username, token });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            var user = await _authService.LoginAsync(dto);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }
            var token = _jwtService.GenerateToken(user);
            return Ok(new { success = true, user.Username, token });
        }

        [HttpPost("change-password/{username}")]
        public async Task<IActionResult> ChangePassword(string username, [FromBody] ChangePasswordDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.CurrentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest(new { success = false, message = "Invalid password data." });
            try
            {
                bool verify = await _authService.ChangePasswordAsync(username, dto);
                if (!verify)
                {
                    return BadRequest(new { message = "Old password is incorrect" });
                }
                return Ok(new { message = "Password change successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDTO request)
        {
            var clientId = _config["Authentication:Google:ClientId"];
            var clientSecret = _config["Authentication:Google:ClientSecret"];
            var redirectUri = _config["Authentication:Google:RedirectUri"];

            var tokenRequestBody = new List<KeyValuePair<string, string>>
            {
                new("code", request.Code),
                new("client_id", clientId),
                new("client_secret", clientSecret),
                new("redirect_uri", redirectUri),
                new("grant_type", "authorization_code")
            };

            var client = _httpClientFactory.CreateClient();
            var response = await client.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(tokenRequestBody));
            var responseContent = await response.Content.ReadAsStringAsync();


            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"❌ Google token exchange failed: {responseContent}");
                return BadRequest(new { error = responseContent });
            }

            var tokenResult = JsonSerializer.Deserialize<JsonElement>(responseContent);
            var idToken = tokenResult.GetProperty("id_token").GetString();

            // Validate and decode ID token (using Google.Apis.Auth)
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken);
            var email = payload.Email;
            var name = payload.Name;

            var user = await _authService.GoogleLoginAsync(email, name);
            if (user == null)
            {
                user = new User
                {
                    Email = email,
                    Username = name,
                    AuthProvider = "Google",
                    CreatedAt = DateTime.UtcNow
                };
                await _userRepository.CreateAsync(user);
            }
            var token = _jwtService.GenerateToken(user);

            // TODO: Create or update user in your database, issue your JWT token, etc.
            return Ok(new
            {
                success = true,
                user = new { user.Id, user.Email, user.Username },
                AuthProvider = "Google",
                token
            });
        }

        [HttpPost("wallet/request-nonce")]
        public async Task<IActionResult> RequestNonce([FromBody] NonceRequestDTO request)
        {
            try
            {
                var response = await _authService.RequestNonceAsync(request.WalletAddress);
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error requesting nonce");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("wallet/login")]
        public async Task<IActionResult> MetaMaskLogin([FromBody] MetaMaskLoginDTO request)
        {
            try
            {
                var user = await _authService.MetaMaskLoginAsync(request);
                var token = _jwtService.GenerateToken(user);

                var response = new AuthResponseDTO
                {
                    Success = true,
                    Token = token,
                    User = new UserDTO
                    {
                        Id = user.Id,
                        Username = user.Username,
                        DisplayName = user.DisplayName,
                        Email = user.Email,
                        WalletAddress = user.WalletAddress,
                        AuthType = user.AuthProvider,
                    }
                };

                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during MetaMask login");
                return StatusCode(500, new { success = false, error = "Internal server error" });
            }
        }
    }
}
