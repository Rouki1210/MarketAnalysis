using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace MarketAnalysisBackend.Authorization
{
    /// <summary>
    /// Custom authorization attribute that validates user roles from JWT token claims.
    /// This attribute reads role claims directly from the decoded JWT token without querying the database.
    ///
    /// Usage:
    ///   [RequireRole("Admin")]
    ///   [RequireRole("Admin", "Moderator")]  // User needs at least one of these roles
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
    public class RequireRoleAttribute : Attribute, IAuthorizationFilter
    {
        private readonly string[] _requiredRoles;

        /// <summary>
        /// Initializes a new instance of RequireRoleAttribute.
        /// </summary>
        /// <param name="roles">One or more role names. User must have at least one of these roles.</param>
        /// <exception cref="ArgumentNullException">Thrown when roles is null</exception>
        /// <exception cref="ArgumentException">Thrown when no roles are specified</exception>
        public RequireRoleAttribute(params string[] roles)
        {
            if (roles == null || roles.Length == 0)
            {
                throw new ArgumentException("At least one role must be specified", nameof(roles));
            }

            _requiredRoles = roles;
        }

        /// <summary>
        /// Called when authorization is required. Validates that the user has at least one of the required roles
        /// by reading claims from the JWT token.
        /// </summary>
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            var logger = context.HttpContext.RequestServices.GetService<ILogger<RequireRoleAttribute>>();

            // ============================================================================
            // STEP 1: Verify user is authenticated
            // ============================================================================
            if (user?.Identity?.IsAuthenticated != true)
            {
                logger?.LogWarning("❌ Authorization failed: User not authenticated");

                context.Result = new UnauthorizedObjectResult(new
                {
                    success = false,
                    message = "Authentication required. Please login to access this resource.",
                    error = "UNAUTHORIZED"
                });
                return;
            }

            // ============================================================================
            // STEP 2: Extract userId from JWT token claims
            // ============================================================================
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                logger?.LogWarning("❌ Authorization failed: Missing NameIdentifier claim in JWT token");

                context.Result = new UnauthorizedObjectResult(new
                {
                    success = false,
                    message = "Invalid authentication token. Missing user identifier.",
                    error = "INVALID_TOKEN"
                });
                return;
            }

            // ============================================================================
            // STEP 3: Log all claims for debugging (helps identify claim type issues)
            // ============================================================================
            var allClaims = user.Claims.Select(c => $"{c.Type}={c.Value}").ToList();
            logger?.LogInformation("🔍 User {UserId} JWT claims: [{Claims}]",
                userIdClaim, string.Join(", ", allClaims));

            // ============================================================================
            // STEP 4: Check if user has any of the required roles from JWT claims
            // ============================================================================
            logger?.LogInformation("🔍 Checking for required roles: [{RequiredRoles}]",
                string.Join(", ", _requiredRoles));

            foreach (var roleName in _requiredRoles)
            {
                // Check both claim type formats because JWT tokens may use either:
                // 1. Full URI: "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                // 2. Short form: "role"
                // This depends on how the token was serialized and the DefaultInboundClaimTypeMap setting

                var hasRoleFullUri = user.HasClaim(ClaimTypes.Role, roleName);
                var hasRoleShortForm = user.HasClaim("role", roleName);
                var hasRole = hasRoleFullUri || hasRoleShortForm;

                logger?.LogDebug("🔍 Role '{RoleName}' check: Full URI={FullUri}, Short form={ShortForm}, Result={Result}",
                    roleName, hasRoleFullUri, hasRoleShortForm, hasRole);

                if (hasRole)
                {
                    logger?.LogInformation("✅ Authorization SUCCESS: User {UserId} has role '{RoleName}'",
                        userIdClaim, roleName);
                    return; // Authorization successful
                }
            }

            // ============================================================================
            // STEP 5: User doesn't have any required roles - deny access
            // ============================================================================
            var userRoles = user.Claims
                .Where(c => c.Type == ClaimTypes.Role || c.Type == "role")
                .Select(c => c.Value)
                .ToList();

            logger?.LogWarning("❌ Authorization FAILED: User {UserId} does not have required roles. " +
                "Required: [{RequiredRoles}], User has: [{UserRoles}]",
                userIdClaim,
                string.Join(", ", _requiredRoles),
                userRoles.Count > 0 ? string.Join(", ", userRoles) : "None");

            context.Result = new ObjectResult(new
            {
                success = false,
                message = $"Access denied. Required role(s): {string.Join(" or ", _requiredRoles)}",
                error = "FORBIDDEN"
            })
            {
                StatusCode = 403
            };
        }
    }
}
