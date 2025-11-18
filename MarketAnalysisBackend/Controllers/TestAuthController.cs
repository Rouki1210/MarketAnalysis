using MarketAnalysisBackend.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MarketAnalysisBackend.Controllers
{
    /// <summary>
    /// Test controller for JWT authentication and authorization.
    /// Use these endpoints to verify JWT tokens are working correctly.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class TestAuthController : ControllerBase
    {
        private readonly ILogger<TestAuthController> _logger;

        public TestAuthController(ILogger<TestAuthController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Public endpoint - No authentication required.
        /// Use this to verify the API is running.
        /// </summary>
        /// <returns>Public message</returns>
        [HttpGet("public")]
        public IActionResult Public()
        {
            _logger.LogInformation("📢 Public endpoint accessed");

            return Ok(new
            {
                success = true,
                message = "This is a public endpoint. No authentication required.",
                timestamp = DateTime.UtcNow,
                endpoint = "GET /api/testauth/public"
            });
        }

        /// <summary>
        /// Authenticated endpoint - Requires valid JWT token.
        /// Use this to verify JWT token validation is working.
        /// </summary>
        /// <returns>Authenticated user info</returns>
        [Authorize]
        [HttpGet("authenticated")]
        public IActionResult Authenticated()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;

            _logger.LogInformation("🔐 Authenticated endpoint accessed by user {UserId}", userId);

            return Ok(new
            {
                success = true,
                message = "You are authenticated!",
                user = new
                {
                    userId,
                    username,
                    email,
                    isAuthenticated = User.Identity?.IsAuthenticated ?? false
                },
                timestamp = DateTime.UtcNow,
                endpoint = "GET /api/testauth/authenticated"
            });
        }

        /// <summary>
        /// Admin only endpoint - Requires JWT token with Admin role.
        /// Use this to verify role-based authorization is working.
        /// </summary>
        /// <returns>Admin access confirmed</returns>
        [RequireRole("Admin")]
        [HttpGet("admin")]
        public IActionResult AdminOnly()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            _logger.LogInformation("👑 Admin endpoint accessed by user {UserId} ({Username})", userId, username);

            return Ok(new
            {
                success = true,
                message = "Welcome, Admin! You have administrative access.",
                user = new
                {
                    userId,
                    username,
                    role = "Admin"
                },
                timestamp = DateTime.UtcNow,
                endpoint = "GET /api/testauth/admin"
            });
        }

        /// <summary>
        /// Moderator only endpoint - Requires JWT token with Moderator role.
        /// Use this to verify different role requirements work.
        /// </summary>
        /// <returns>Moderator access confirmed</returns>
        [RequireRole("Moderator")]
        [HttpGet("moderator")]
        public IActionResult ModeratorOnly()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            _logger.LogInformation("🛡️ Moderator endpoint accessed by user {UserId} ({Username})", userId, username);

            return Ok(new
            {
                success = true,
                message = "Welcome, Moderator! You have moderation access.",
                user = new
                {
                    userId,
                    username,
                    role = "Moderator"
                },
                timestamp = DateTime.UtcNow,
                endpoint = "GET /api/testauth/moderator"
            });
        }

        /// <summary>
        /// Multiple roles endpoint - Requires Admin OR Moderator role.
        /// Use this to verify multiple role requirements work.
        /// </summary>
        /// <returns>Access confirmed for privileged users</returns>
        [RequireRole("Admin", "Moderator")]
        [HttpGet("privileged")]
        public IActionResult Privileged()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

            // Also check short form
            var rolesShortForm = User.FindAll("role").Select(c => c.Value).ToList();
            var allRoles = roles.Concat(rolesShortForm).Distinct().ToList();

            _logger.LogInformation("⭐ Privileged endpoint accessed by user {UserId} with roles [{Roles}]",
                userId, string.Join(", ", allRoles));

            return Ok(new
            {
                success = true,
                message = "Welcome! You have privileged access (Admin or Moderator).",
                user = new
                {
                    userId,
                    username,
                    roles = allRoles
                },
                timestamp = DateTime.UtcNow,
                endpoint = "GET /api/testauth/privileged"
            });
        }

        /// <summary>
        /// Claims endpoint - Returns ALL claims from JWT token.
        /// Use this to debug JWT token contents and verify claims are decoded correctly.
        /// </summary>
        /// <returns>All JWT claims</returns>
        [Authorize]
        [HttpGet("claims")]
        public IActionResult Claims()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Get all claims from JWT token
            var allClaims = User.Claims.Select(c => new
            {
                type = c.Type,
                value = c.Value,
                // Show if it's a standard claim type
                isStandardClaim = c.Type.StartsWith("http://schemas.") ||
                                 c.Type.StartsWith("http://www.w3.org/")
            }).ToList();

            // Get roles specifically (both formats)
            var rolesFullUri = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            var rolesShortForm = User.FindAll("role").Select(c => c.Value).ToList();

            _logger.LogInformation("🔍 Claims endpoint accessed by user {UserId}. Total claims: {ClaimCount}",
                userId, allClaims.Count);

            return Ok(new
            {
                success = true,
                message = "Here are all claims from your JWT token",
                user = new
                {
                    userId,
                    isAuthenticated = User.Identity?.IsAuthenticated ?? false,
                    authenticationType = User.Identity?.AuthenticationType
                },
                claims = new
                {
                    total = allClaims.Count,
                    all = allClaims,
                    roles = new
                    {
                        fullUriFormat = rolesFullUri,
                        shortFormat = rolesShortForm,
                        combined = rolesFullUri.Concat(rolesShortForm).Distinct().ToList()
                    }
                },
                timestamp = DateTime.UtcNow,
                endpoint = "GET /api/testauth/claims"
            });
        }

        /// <summary>
        /// User role endpoint - Requires User role.
        /// Use this to test basic user (non-admin) authorization.
        /// </summary>
        /// <returns>User access confirmed</returns>
        [RequireRole("User")]
        [HttpGet("user")]
        public IActionResult UserOnly()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            _logger.LogInformation("👤 User endpoint accessed by user {UserId} ({Username})", userId, username);

            return Ok(new
            {
                success = true,
                message = "Welcome, User! You have basic user access.",
                user = new
                {
                    userId,
                    username,
                    role = "User"
                },
                timestamp = DateTime.UtcNow,
                endpoint = "GET /api/testauth/user"
            });
        }

        /// <summary>
        /// Health check endpoint with authentication status.
        /// Use this to verify API and authentication are both working.
        /// </summary>
        /// <returns>Health status</returns>
        [HttpGet("health")]
        public IActionResult Health()
        {
            var isAuthenticated = User.Identity?.IsAuthenticated ?? false;
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            _logger.LogInformation("🏥 Health check - Authenticated: {IsAuth}, UserId: {UserId}",
                isAuthenticated, userId ?? "N/A");

            return Ok(new
            {
                success = true,
                status = "healthy",
                api = "running",
                authentication = new
                {
                    configured = true,
                    userAuthenticated = isAuthenticated,
                    userId = isAuthenticated ? userId : null
                },
                timestamp = DateTime.UtcNow,
                endpoint = "GET /api/testauth/health"
            });
        }

        /// <summary>
        /// Test endpoint that shows expected behavior for different scenarios.
        /// Returns helpful information about what to expect.
        /// </summary>
        /// <returns>Test guide</returns>
        [HttpGet("guide")]
        public IActionResult Guide()
        {
            return Ok(new
            {
                success = true,
                message = "JWT Authentication Test Guide",
                endpoints = new[]
                {
                    new
                    {
                        path = "GET /api/testauth/public",
                        auth = "None",
                        expectedResult = "200 OK - Always works",
                        purpose = "Verify API is running"
                    },
                    new
                    {
                        path = "GET /api/testauth/authenticated",
                        auth = "JWT token required",
                        expectedResult = "200 OK with token, 401 without",
                        purpose = "Verify JWT validation works"
                    },
                    new
                    {
                        path = "GET /api/testauth/claims",
                        auth = "JWT token required",
                        expectedResult = "200 OK - Shows all claims",
                        purpose = "Debug JWT token contents"
                    },
                    new
                    {
                        path = "GET /api/testauth/admin",
                        auth = "Admin role required",
                        expectedResult = "200 OK for Admin, 403 for others",
                        purpose = "Verify Admin role authorization"
                    },
                    new
                    {
                        path = "GET /api/testauth/moderator",
                        auth = "Moderator role required",
                        expectedResult = "200 OK for Moderator, 403 for others",
                        purpose = "Verify Moderator role authorization"
                    },
                    new
                    {
                        path = "GET /api/testauth/user",
                        auth = "User role required",
                        expectedResult = "200 OK for User, 403 for others",
                        purpose = "Verify User role authorization"
                    },
                    new
                    {
                        path = "GET /api/testauth/privileged",
                        auth = "Admin OR Moderator required",
                        expectedResult = "200 OK for Admin/Moderator, 403 for others",
                        purpose = "Verify multiple role requirements"
                    },
                    new
                    {
                        path = "GET /api/testauth/health",
                        auth = "Optional",
                        expectedResult = "200 OK - Shows auth status",
                        purpose = "Check API and auth health"
                    }
                },
                howToTest = new
                {
                    step1 = "Call GET /api/testauth/public - Should always return 200 OK",
                    step2 = "Login via POST /api/auth/login to get JWT token",
                    step3 = "Add header: Authorization: Bearer YOUR_TOKEN",
                    step4 = "Call GET /api/testauth/authenticated - Should return 200 OK",
                    step5 = "Call GET /api/testauth/claims - See all your claims",
                    step6 = "Call role-specific endpoints based on your role",
                    step7 = "Check logs for detailed authentication flow"
                },
                expectedLogs = new
                {
                    programCs = "✅ JWT token validated successfully - User: X, Roles: [...]",
                    requireRoleAttribute = "🔍 User X JWT claims: [...] \n✅ Authorization SUCCESS: User X has role 'Admin'"
                }
            });
        }
    }
}
