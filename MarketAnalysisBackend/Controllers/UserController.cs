using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        private readonly IUserRepository _userRepo;
        private readonly IUserService _userSer;
        private readonly IJwtService _jwtService;
        public UserController(IUserRepository userRepo, IUserService userSer, IJwtService jwtService)
        {
            _userRepo = userRepo;
            _userSer = userSer;
            _jwtService = jwtService;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userRepo.GetAllAsync();
            return Ok(users);
        }

        [HttpDelete("delete-all")]
        public async Task<IActionResult> DeleteAllUsers()
        {
            await _userRepo.DeleteAllAsync();
            return Ok(new { success = true, message = "All users deleted." });
        }

        [HttpGet("{emailOrUsername}")]
        public async Task<IActionResult> GetUserByEmailOrUsername(string emailorusername)
        {
            var user = await _userRepo.GetByEmailOrUsernameAsync(emailorusername);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found." });
            }
            return Ok(user);
        }

        [HttpGet("{walletaddress}")]
        public async Task<IActionResult> GetUserByWalletAddress(string walletaddress)
        {
            var user = await _userRepo.GetByWalletAddressAsync(walletaddress);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found." });
            }
            return Ok(user);
        }

        [HttpGet("userInfo/{token}")]
        public async Task<IActionResult> GetUserInfoFromToken(string token)
        {
            var jwtPayload = _jwtService.GetPrincipalFromToken(token);
            if (jwtPayload == null)
            {
                return BadRequest(new { success = false, message = "Invalid token." });
            }

            var username = jwtPayload?.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(username))
            {
                return BadRequest(new {success = false, message = "No user info found in token"});
            }
            var user = await _userSer.GetUserByEmailorUsername(username);
            
            if (user == null)
            {
                return NotFound(new {success = false, message = "User not found." });
            }
            return Ok(new {
                success = true,
                user = new UserDTO
                {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                    WalletAddress = user.WalletAddress,
                    AuthType = user.AuthProvider
                }
            });
        }
    }
}
