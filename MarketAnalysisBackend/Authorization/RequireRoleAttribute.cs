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

        public Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;

            // Check if user is authenticated
            if (!user.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedObjectResult(new
                {
                    success = false,
                    message = "You need to login to access this source",
                    error = "UNAUTHORIZED"
                });
                return Task.CompletedTask;
            }

            // Check if user has NameIdentifier claim (required in JWT)
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                context.Result = new UnauthorizedObjectResult(new
                {
                    success = false,
                    message = "Token is not available",
                    error = "INVALID_TOKEN"
                });
                return Task.CompletedTask;
            }

            // ✅ FIX: Read roles from JWT token claims instead of querying database
            // Check if user has any of the required roles in their JWT token
            foreach (var roleName in _role)
            {
                // Check if user has this role claim
                if (user.HasClaim(ClaimTypes.Role, roleName))
                {
                    // User has the required role - authorization successful
                    return Task.CompletedTask;
                }
            }

            // User doesn't have any of the required roles
            context.Result = new ObjectResult(new
            {
                success = false,
                message = $"You need one of these roles to access this resource: {string.Join(", ", _role)}",
                error = "FORBIDDEN"
            })
            {
                StatusCode = 403
            };

            return Task.CompletedTask;
        }
    }
}
