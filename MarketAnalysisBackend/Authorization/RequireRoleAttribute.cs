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
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<RequireRoleAttribute>>();

            // Check if user is authenticated
            if (!user.Identity?.IsAuthenticated ?? true)
            {
                logger.LogWarning("❌ Authorization failed: User not authenticated");
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
                logger.LogWarning("❌ Authorization failed: Missing NameIdentifier claim");
                context.Result = new UnauthorizedObjectResult(new
                {
                    success = false,
                    message = "Token is not available",
                    error = "INVALID_TOKEN"
                });
                return Task.CompletedTask;
            }

            // 🔍 DEBUG: Log ALL claims in the token to see what was decoded
            var allClaims = user.Claims.Select(c => $"{c.Type} = {c.Value}").ToList();
            logger.LogInformation("🔍 User {UserId} claims: [{Claims}]", userIdClaim, string.Join(", ", allClaims));

            // ✅ FIX: Read roles from JWT token claims instead of querying database
            // Check if user has any of the required roles in their JWT token
            logger.LogInformation("🔍 Checking for required roles: [{RequiredRoles}]", string.Join(", ", _role));

            foreach (var roleName in _role)
            {
                // Try to find role claim with exact match
                var hasRole = user.HasClaim(ClaimTypes.Role, roleName);
                logger.LogInformation("🔍 HasClaim(ClaimTypes.Role='{ClaimType}', '{RoleName}'): {HasRole}",
                    ClaimTypes.Role, roleName, hasRole);

                if (hasRole)
                {
                    // User has the required role - authorization successful
                    logger.LogInformation("✅ Authorization SUCCESS: User {UserId} has role '{Role}'", userIdClaim, roleName);
                    return Task.CompletedTask;
                }
            }

            // User doesn't have any of the required roles
            logger.LogWarning("❌ Authorization FAILED: User {UserId} does not have any required roles [{RequiredRoles}]",
                userIdClaim, string.Join(", ", _role));

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
