using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MarketAnalysisBackend.Controllers
{
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDTO dto)
        {
            try
            {
                var user = _userService.Register(dto.Email, dto.Username, dto.Password);
                return Ok(new { message = "User registered", username = user.Username });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDTO dto)
        {
            var success = _userService.Login(dto.Username, dto.Password);
            if (!success) return Unauthorized("Invalid username or password.");
            return Ok(new { message = "Login successful" });
        }

    }
}
