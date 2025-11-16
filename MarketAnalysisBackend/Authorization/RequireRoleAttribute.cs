using MarketAnalysisBackend.Services.Implementations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;


namespace MarketAnalysisBackend.Authorization
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
    public class RequireRoleAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly string[] _role;

        public RequireRoleAttribute(params string[] role)
        {
            _role = role;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (!user.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedObjectResult(new
                {
                    success = false,
                    message = "You need to login to access this source ",
                    error = "UNAUTHORIZED"
                });
                return; 
            }

            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                // Token không hợp lệ hoặc không có userId
                context.Result = new UnauthorizedObjectResult(new
                {
                    success = false,
                    message = "Token is not available",
                    error = "INVALID_TOKEN"
                });
                return;
            }

            var roleService = context.HttpContext.RequestServices.GetRequiredService<IRoleService>();
            foreach (var roleName in _role)
            {
                bool hasRole = await roleService.HasRoleAsync(userId, roleName);
                if (hasRole)
                {
                    return;
                }
            }

            context.Result = new ObjectResult(new
            {
                success = false,
                message = "You need to login to access this source",
                error = "FORBIDDEN"
            })
            {
                StatusCode = 403
            };
        }
    }
}
