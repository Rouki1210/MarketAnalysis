using MarketAnalysisBackend.Authorization;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Services.Implementations;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;
        private readonly IUserService _userService;
        public RoleController(IRoleService roleService, IUserService userService)
        {
            _roleService = roleService;
            _userService = userService;

        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        [RequireRole("Admin")]
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<List<RoleDto>>), 200)]
        public async Task<ActionResult<ApiResponse<List<RoleDto>>>> GetAllRoles()
        {
            try
            {
                var roles = await _roleService.GetAllRolesAsync();

                // Map sang DTO
                var roleDtos = roles.Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    CreatedAt = r.CreateAt,
                    UserCount = r.UserRoles?.Count ?? 0
                }).ToList();

                return Ok(ApiResponse<List<RoleDto>>.SuccessResponse(
                    roleDtos,
                    $"Tìm thấy {roleDtos.Count} roles"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<List<RoleDto>>.ErrorResponse(
                    "Không thể lấy danh sách roles"));
            }
        }

        [RequireRole("Admin")]
        [HttpGet("{roleId}")]
        [ProducesResponseType(typeof(ApiResponse<RoleDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<RoleDto>), 404)]
        public async Task<ActionResult<ApiResponse<RoleDto>>> GetRoleById(int roleId)
        {
            try
            {
                var role = await _roleService.GetRoleByIdAsync(roleId);

                if (role == null)
                {
                    return NotFound(ApiResponse<RoleDto>.ErrorResponse(
                        $"Không tìm thấy role với ID {roleId}"));
                }

                var roleDto = new RoleDto
                {
                    Id = role.Id,
                    Name = role.Name,
                    Description = role.Description,
                    CreatedAt = role.CreateAt,
                    UserCount = role.UserRoles?.Count ?? 0
                };

                return Ok(ApiResponse<RoleDto>.SuccessResponse(roleDto));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<RoleDto>.ErrorResponse(
                    "Không thể lấy thông tin role"));
            }
        }

        [RequireRole("User", "Admin")]
        [HttpGet("user/{userId}")]
        [ProducesResponseType(typeof(ApiResponse<UserRolesDto>), 200)]
        public async Task<ActionResult<ApiResponse<UserRolesDto>>> GetUserRoles(int userId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();

                if (currentUserId != userId)
                {
                    var isAdmin = await _roleService.HasRoleAsync(currentUserId!.Value, "Admin");
                    if (!isAdmin)
                    {
                        return Forbid(); // 403
                    }
                }

                var user = await _userService.GetUserById(userId);
                if (user == null)
                {
                    return NotFound(ApiResponse<UserRolesDto>.ErrorResponse(
                        $"Không tìm thấy user với ID {userId}"));
                }

                var roles = await _roleService.GetUserRoleAsync(userId);

                var userRolesDto = new UserRolesDto
                {
                    UserId = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    Roles = roles
                };

                return Ok(ApiResponse<UserRolesDto>.SuccessResponse(userRolesDto));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<UserRolesDto>.ErrorResponse(
                    "Không thể lấy thông tin roles"));
            }
        }

        [RequireRole("User", "Admin", "Moderator", "Premium")]
        [HttpGet("my-roles")]
        [ProducesResponseType(typeof(ApiResponse<List<string>>), 200)]
        public async Task<ActionResult<ApiResponse<List<string>>>> GetMyRoles()
        {
            try
            {
                var currentUserId = GetCurrentUserId();

                if (!currentUserId.HasValue)
                {
                    return Unauthorized(ApiResponse<List<string>>.ErrorResponse(
                        "User không hợp lệ"));
                }

                var roles = await _roleService.GetUserRoleAsync(currentUserId.Value);

                return Ok(ApiResponse<List<string>>.SuccessResponse(
                    roles,
                    $"Bạn có {roles.Count} roles"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<List<string>>.ErrorResponse(
                    "Không thể lấy thông tin roles"));
            }
        }

        [RequireRole("Admin")]
        [HttpPost("assign")]
        [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
        [ProducesResponseType(typeof(ApiResponse<bool>), 400)]
        public async Task<ActionResult<ApiResponse<bool>>> AssignRole(
            [FromBody] AssignRoleRequest request)
        {
            try
            {
                // Validate input
                if (request.UserId <= 0)
                {
                    return BadRequest(ApiResponse<bool>.ErrorResponse(
                        "UserId không hợp lệ"));
                }

                if (string.IsNullOrWhiteSpace(request.RoleName))
                {
                    return BadRequest(ApiResponse<bool>.ErrorResponse(
                        "RoleName không được để trống"));
                }

                // Kiểm tra role có tồn tại không
                var role = await _roleService.GetRoleByNameAsync(request.RoleName);
                if (role == null)
                {
                    return BadRequest(ApiResponse<bool>.ErrorResponse(
                        $"Role '{request.RoleName}' không tồn tại"));
                }

                // Gán role
                var result = await _roleService.AssignRoleAsync(
                    request.UserId,
                    request.RoleName);

                if (!result)
                {
                    return BadRequest(ApiResponse<bool>.ErrorResponse(
                        $"User đã có role '{request.RoleName}' rồi"));
                }

                return Ok(ApiResponse<bool>.SuccessResponse(
                    true,
                    $"Đã gán role '{request.RoleName}' cho user {request.UserId}"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "Không thể gán role"));
            }
        }

        [RequireRole("Admin")]
        [HttpPost("remove")]
        [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
        [ProducesResponseType(typeof(ApiResponse<bool>), 404)]
        public async Task<ActionResult<ApiResponse<bool>>> RemoveRole(
            [FromBody] AssignRoleRequest request)
        {
            try
            {
                // Validate input
                if (request.UserId <= 0)
                {
                    return BadRequest(ApiResponse<bool>.ErrorResponse(
                        "UserId không hợp lệ"));
                }

                if (string.IsNullOrWhiteSpace(request.RoleName))
                {
                    return BadRequest(ApiResponse<bool>.ErrorResponse(
                        "RoleName không được để trống"));
                }

                // Không cho xóa role "User" của user thường
                if (request.RoleName.Equals("User", StringComparison.OrdinalIgnoreCase))
                {
                    var userRoles = await _roleService.GetUserRoleAsync(request.UserId);

                    // Nếu user chỉ có 1 role "User" → không cho xóa
                    if (userRoles.Count == 1 && userRoles.Contains("User"))
                    {
                        return BadRequest(ApiResponse<bool>.ErrorResponse(
                            "Không thể xóa role 'User' duy nhất của user"));
                    }
                }

                // Xóa role
                var result = await _roleService.RemoveRoleAsync(
                    request.UserId,
                    request.RoleName);

                if (!result)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse(
                        $"User không có role '{request.RoleName}'"));
                }

                return Ok(ApiResponse<bool>.SuccessResponse(
                    true,
                    $"Đã xóa role '{request.RoleName}' của user {request.UserId}"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "Không thể xóa role"));
            }
        }
    }
}
