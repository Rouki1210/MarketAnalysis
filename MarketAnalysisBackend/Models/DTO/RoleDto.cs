using System.ComponentModel.DataAnnotations;

namespace MarketAnalysisBackend.Models.DTO
{
    public class RoleDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int UserCount { get; set; } 
    }

    public class AssignRoleRequest
    {
        public int UserId { get; set; }
        public string RoleName { get; set; } = string.Empty;
    }

    public class CreateRoleRequest
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;
    }

    public class UserRolesDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new List<string>();
    }
}