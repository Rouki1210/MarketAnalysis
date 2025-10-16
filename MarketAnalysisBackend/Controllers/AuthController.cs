using Google.Apis.Auth;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Services.Interfaces;
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
        public AuthController(IAuthService userService, IJwtService jwtService, IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _authService = userService;
            _jwtService = jwtService;
            _httpClientFactory = httpClientFactory;
            _config = config;
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
            var token = _jwtService.GenerateToken(user);
            if (user == null)
           {
                return Unauthorized(new { message = "Invalid credentials" });
           }
           return Ok(new { success = true, user.Username, token });
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
            var token = _jwtService.GenerateToken(user);

            // TODO: Create or update user in your database, issue your JWT token, etc.
            return Ok(new
            {
                success=true,
                user = new { user.Id, user.Email, user.Username },
                token
            });
        }

        
        [HttpDelete]
        public async Task DeleteAllUsers()
        {
            await _authService.DeleteAllUsersAsync();
        }
    }
}
