using Google.Apis.Auth;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IJwtService _jwtService;
        public AuthController(IAuthService userService, IJwtService jwtService)
        {
            _authService = userService;
            _jwtService = jwtService;
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
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDTO dto)
        {
            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken, new GoogleJsonWebSignature.ValidationSettings());

                // Check user exists or not
                var user = await _authService.GoogleLoginAsync(payload.Email, payload.Name);

                // Generate JWT
                var token = _jwtService.GenerateToken(user);

                return Ok(new { token, user });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }

        }
        [HttpDelete]
        public async Task DeleteAllUsers()
        {
            await _authService.DeleteAllUsersAsync();
        }
    }
}
