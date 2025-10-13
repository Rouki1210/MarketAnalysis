using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MarketAnalysisBackend.Controllers
{
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService userService)
        {
            _authService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
        {
           var user = await _authService.RegisterAsync(dto);
           return Ok(new { message = "Register success", user.Username });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
           var user = await _authService.LoginAsync(dto);
           if (user == null)
           {
                return Unauthorized(new { message = "Invalid credentials" });
           }
           return Ok(new { message = "Login success", user.Username });
        }

    }
}
