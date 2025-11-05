using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
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
        private readonly IUserProfileService _profileService;
        private readonly IUserProfileService _profileSer;
        public UserController(IUserRepository userRepo, IUserService userSer, IJwtService jwtService, IUserProfileService profileSer)
        {
            _userRepo = userRepo;
            _userSer = userSer;
            _jwtService = jwtService;
            _profileSer = profileSer;
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


        [HttpGet("by-email-or-username/{emailOrUsername}")]
        public async Task<IActionResult> GetUserByEmailOrUsername(string emailOrUsername)
        {
            if (string.IsNullOrWhiteSpace(emailOrUsername))
                return BadRequest(new { success = false, message = "Email or username is required." });

            var user = await _userSer.GetUserByEmailorUsername(emailOrUsername);

            if (user == null)
                return NotFound(new { success = false, message = "User not found." });

            return Ok(new { success = true, data = user });
        }

        [HttpGet("by-wallet-address/{walletAddress}")]
        public async Task<IActionResult> GetUserByWalletAddress(string walletAddress)
        {
            var user = await _userRepo.GetByWalletAddressAsync(walletAddress);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found." });
            }
            return Ok(user);
        }

        [HttpPut("updateProfile")]
        public async Task<IActionResult> UpdateUser(string token, [FromBody] UpdateProfileDTO updateDto)
        {
            var jwtPayload = _jwtService.GetPrincipalFromToken(token);
            if (jwtPayload == null)
            {
                return BadRequest(new { success = false, message = "Invalid token." });
            }
            var userIdStr = jwtPayload?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out int userId))
            {
                return BadRequest(new { success = false, message = "Invalid user id in token." });
            }
            var updatedUser = await _profileSer.UpdateProfileAsync(userId, updateDto);
            return Ok(new { success = true, data = updatedUser });
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
                return BadRequest(new { success = false, message = "No user info found in token" });
            }
            var user = await _userSer.GetUserByEmailorUsername(username);

            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found." });
            }
            return Ok(new
            {
                success = true,
                user = new UserDTO
                {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                    DisplayName = user.DisplayName,
                    WalletAddress = user.WalletAddress,
                    AuthType = user.AuthProvider,
                    Bio = user.Bio,
                    Website = user.Website,
                    Birthday = user.Brithday
                }
            });
        }
    }
}
