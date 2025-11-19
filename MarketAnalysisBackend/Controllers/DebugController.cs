using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DebugController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<DebugController> _logger;

        public DebugController(IConfiguration configuration, ILogger<DebugController> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        #region Configuration & Health Checks

        /// <summary>
        /// Check JWT configuration and environment
        /// </summary>
        [HttpGet("config-check")]
        [AllowAnonymous]
        public IActionResult ConfigCheck()
        {
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];
            var jwtExpires = _configuration["Jwt:ExpiresInMinutes"];

            Console.WriteLine("=== CONFIG CHECK ===");
            Console.WriteLine($"Key: {jwtKey}");
            Console.WriteLine($"Issuer: {jwtIssuer}");
            Console.WriteLine($"Audience: {jwtAudience}");
            Console.WriteLine($"ExpiresInMinutes: {jwtExpires}");
            Console.WriteLine("===================");

            return Ok(new
            {
                success = true,
                timestamp = DateTime.UtcNow,
                configuration = new
                {
                    jwtKeyExists = !string.IsNullOrEmpty(jwtKey),
                    jwtKeyLength = jwtKey?.Length ?? 0,
                    jwtKeyPreview = jwtKey != null ? jwtKey.Substring(0, Math.Min(20, jwtKey.Length)) + "..." : "NOT SET",
                    jwtKeyFull = jwtKey, // ⚠️ Remove in production!
                    jwtIssuer = jwtIssuer ?? "NOT SET",
                    jwtAudience = jwtAudience ?? "NOT SET",
                    jwtExpiresInMinutes = jwtExpires ?? "NOT SET"
                },
                environmentInfo = new
                {
                    environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
                    currentDirectory = Directory.GetCurrentDirectory(),
                    machineName = Environment.MachineName,
                    osVersion = Environment.OSVersion.ToString(),
                    dotnetVersion = Environment.Version.ToString()
                },
                validation = new
                {
                    keyLengthOk = (jwtKey?.Length ?? 0) >= 32,
                    issuerSet = !string.IsNullOrEmpty(jwtIssuer),
                    audienceSet = !string.IsNullOrEmpty(jwtAudience),
                    allValid = (jwtKey?.Length ?? 0) >= 32 &&
                              !string.IsNullOrEmpty(jwtIssuer) &&
                              !string.IsNullOrEmpty(jwtAudience)
                }
            });
        }

        /// <summary>
        /// System health check
        /// </summary>
        [HttpGet("health")]
        [AllowAnonymous]
        public IActionResult HealthCheck()
        {
            return Ok(new
            {
                status = "Healthy",
                timestamp = DateTime.UtcNow,
                uptime = DateTime.UtcNow - Process.GetCurrentProcess().StartTime.ToUniversalTime(),
                server = new
                {
                    machineName = Environment.MachineName,
                    osVersion = Environment.OSVersion.ToString(),
                    processorCount = Environment.ProcessorCount,
                    workingSet = Environment.WorkingSet / 1024 / 1024 + " MB"
                }
            });
        }

        #endregion

        #region Token Generation

        /// <summary>
        /// Generate test JWT token
        /// </summary>
        [HttpPost("generate-token")]
        [AllowAnonymous]
        public IActionResult GenerateToken([FromBody] GenerateTokenRequest request)
        {
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];
            var jwtExpires = _configuration.GetValue<int>("Jwt:ExpiresInMinutes", 60);

            Console.WriteLine("=== GENERATE TOKEN ===");
            Console.WriteLine($"Key Length: {jwtKey?.Length ?? 0}");
            Console.WriteLine($"Issuer: {jwtIssuer}");
            Console.WriteLine($"Audience: {jwtAudience}");
            Console.WriteLine($"Expires: {jwtExpires} minutes");
            Console.WriteLine($"User ID: {request.UserId}");
            Console.WriteLine($"Username: {request.Username}");
            Console.WriteLine("=====================");

            if (string.IsNullOrEmpty(jwtKey) || jwtKey.Length < 32)
            {
                return BadRequest(new
                {
                    success = false,
                    error = "JWT Key is not configured properly",
                    details = $"Key length: {jwtKey?.Length ?? 0} (minimum 32 required)"
                });
            }

            var claims = new List<Claim>
            {
                // Standard JWT claims
                new Claim(JwtRegisteredClaimNames.Sub, request.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, request.Email ?? "test@example.com"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                
                // ASP.NET Core Identity claims
                new Claim(ClaimTypes.NameIdentifier, request.UserId.ToString()),
                new Claim(ClaimTypes.Name, request.Username),
                new Claim(ClaimTypes.Email, request.Email ?? "test@example.com"),
                
                // Custom claims
                new Claim("username", request.Username),
                new Claim("displayName", request.DisplayName ?? request.Username)
            };

            // Add roles
            if (request.Roles != null && request.Roles.Any())
            {
                foreach (var role in request.Roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                    Console.WriteLine($"Added role: {role}");
                }
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var now = DateTime.UtcNow;
            var expires = now.AddMinutes(jwtExpires);

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                notBefore: now,
                expires: expires,
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            Console.WriteLine($"✅ Token generated successfully");
            Console.WriteLine($"Token length: {tokenString.Length}");
            Console.WriteLine($"Expires at: {expires}");

            return Ok(new
            {
                success = true,
                token = tokenString,
                tokenInfo = new
                {
                    issuedAt = now,
                    expiresAt = expires,
                    expiresInMinutes = jwtExpires,
                    claims = claims.Select(c => new
                    {
                        type = c.Type,
                        shortType = c.Type.Split('/').Last(),
                        value = c.Value
                    }),
                    issuer = jwtIssuer,
                    audience = jwtAudience
                },
                usage = new
                {
                    swagger = "1. Click 'Authorize' button\n2. Enter: Bearer {token}\n3. Click 'Authorize'\n4. Test protected endpoints",
                    curl = $"curl -H 'Authorization: Bearer {tokenString.Substring(0, 30)}...' https://localhost:7175/api/Debug/test-auth",
                    postman = "Add header: Authorization: Bearer {token}"
                }
            });
        }

        /// <summary>
        /// Generate token with custom expiration
        /// </summary>
        [HttpPost("generate-token-custom")]
        [AllowAnonymous]
        public IActionResult GenerateTokenCustom([FromBody] GenerateTokenCustomRequest request)
        {
            var generateRequest = new GenerateTokenRequest
            {
                UserId = request.UserId,
                Username = request.Username,
                Email = request.Email,
                DisplayName = request.DisplayName,
                Roles = request.Roles
            };

            // Temporarily override expiration
            var originalExpires = _configuration["Jwt:ExpiresInMinutes"];

            // This won't actually work with IConfiguration, but shows the intent
            // In production, you'd pass expiration to token generation

            return GenerateToken(generateRequest);
        }

        #endregion

        #region Token Validation

        /// <summary>
        /// Validate token manually
        /// </summary>
        [HttpPost("validate-token")]
        [AllowAnonymous]
        public IActionResult ValidateToken([FromBody] ValidateTokenRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Token))
            {
                return BadRequest(new { success = false, error = "Token is required" });
            }

            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];

            Console.WriteLine("=== VALIDATE TOKEN ===");
            Console.WriteLine($"Key Length: {jwtKey?.Length ?? 0}");
            Console.WriteLine($"Issuer: {jwtIssuer}");
            Console.WriteLine($"Audience: {jwtAudience}");
            Console.WriteLine($"Token Length: {request.Token.Length}");
            Console.WriteLine($"Token Preview: {request.Token.Substring(0, Math.Min(50, request.Token.Length))}...");
            Console.WriteLine("=====================");

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(jwtKey!);

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = jwtAudience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(request.Token, validationParameters, out var validatedToken);
                var jwtToken = (JwtSecurityToken)validatedToken;

                Console.WriteLine("✅ Token is VALID");

                return Ok(new
                {
                    success = true,
                    message = "✅ Token is valid!",
                    tokenInfo = new
                    {
                        isValid = true,
                        isExpired = jwtToken.ValidTo < DateTime.UtcNow,
                        issuedAt = jwtToken.ValidFrom,
                        expiresAt = jwtToken.ValidTo,
                        timeUntilExpiration = jwtToken.ValidTo - DateTime.UtcNow,
                        issuer = jwtToken.Issuer,
                        audience = jwtToken.Audiences.FirstOrDefault(),
                        algorithm = jwtToken.SignatureAlgorithm,
                        claims = principal.Claims.Select(c => new
                        {
                            type = c.Type,
                            shortType = c.Type.Split('/').Last(),
                            value = c.Value
                        })
                    },
                    userInfo = new
                    {
                        userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                        userName = principal.FindFirst(ClaimTypes.Name)?.Value,
                        email = principal.FindFirst(ClaimTypes.Email)?.Value,
                        roles = principal.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList()
                    }
                });
            }
            catch (SecurityTokenExpiredException ex)
            {
                Console.WriteLine($"❌ Token EXPIRED: {ex.Message}");
                return BadRequest(new
                {
                    success = false,
                    error = "TOKEN_EXPIRED",
                    message = "Token has expired",
                    details = ex.Message,
                    hint = "Generate a new token"
                });
            }
            catch (SecurityTokenInvalidSignatureException ex)
            {
                Console.WriteLine($"❌ INVALID SIGNATURE: {ex.Message}");
                return BadRequest(new
                {
                    success = false,
                    error = "INVALID_SIGNATURE",
                    message = "Invalid token signature - Key mismatch",
                    details = ex.Message,
                    hint = "Check if Jwt:Key in appsettings.json matches the key used to generate the token"
                });
            }
            catch (SecurityTokenInvalidIssuerException ex)
            {
                Console.WriteLine($"❌ INVALID ISSUER: {ex.Message}");
                return BadRequest(new
                {
                    success = false,
                    error = "INVALID_ISSUER",
                    message = "Token issuer does not match",
                    details = ex.Message,
                    expectedIssuer = jwtIssuer
                });
            }
            catch (SecurityTokenInvalidAudienceException ex)
            {
                Console.WriteLine($"❌ INVALID AUDIENCE: {ex.Message}");
                return BadRequest(new
                {
                    success = false,
                    error = "INVALID_AUDIENCE",
                    message = "Token audience does not match",
                    details = ex.Message,
                    expectedAudience = jwtAudience
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ VALIDATION ERROR: {ex.GetType().Name} - {ex.Message}");
                return BadRequest(new
                {
                    success = false,
                    error = ex.GetType().Name,
                    message = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        /// <summary>
        /// Decode token without validation (see claims)
        /// </summary>
        [HttpPost("decode-token")]
        [AllowAnonymous]
        public IActionResult DecodeToken([FromBody] ValidateTokenRequest request)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(request.Token) as JwtSecurityToken;

                if (jsonToken == null)
                {
                    return BadRequest(new { success = false, error = "Invalid token format" });
                }

                return Ok(new
                {
                    success = true,
                    header = new
                    {
                        algorithm = jsonToken.Header.Alg,
                        type = jsonToken.Header.Typ,
                        kid = jsonToken.Header.Kid
                    },
                    payload = new
                    {
                        issuer = jsonToken.Issuer,
                        audience = jsonToken.Audiences,
                        issuedAt = jsonToken.ValidFrom,
                        expiresAt = jsonToken.ValidTo,
                        notBefore = jsonToken.ValidFrom,
                        claims = jsonToken.Claims.Select(c => new
                        {
                            type = c.Type,
                            value = c.Value
                        })
                    },
                    status = new
                    {
                        isExpired = jsonToken.ValidTo < DateTime.UtcNow,
                        isNotYetValid = jsonToken.ValidFrom > DateTime.UtcNow,
                        timeUntilExpiration = jsonToken.ValidTo - DateTime.UtcNow
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }

        #endregion

        #region Authentication Tests

        /// <summary>
        /// Check current authentication status (Anonymous)
        /// </summary>
        [HttpGet("auth-status")]
        [AllowAnonymous]
        public IActionResult GetAuthStatus()
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            var user = User;

            _logger.LogInformation("=== AUTH STATUS CHECK ===");
            _logger.LogInformation("Auth Header: {HasHeader}", !string.IsNullOrEmpty(authHeader));
            _logger.LogInformation("User Authenticated: {IsAuth}", user?.Identity?.IsAuthenticated);
            _logger.LogInformation("Claims Count: {Count}", user?.Claims.Count());

            var claims = new List<object>();
            if (user?.Claims != null)
            {
                claims = user.Claims
                    .Select(c => new
                    {
                        type = c.Type,
                        shortType = c.Type.Split('/').Last(),
                        value = c.Value
                    })
                    .ToList<object>();
            }

            var roles = new List<string>();
            if (user != null)
            {
                var roleClaims = user.FindAll(ClaimTypes.Role);
                if (roleClaims != null && roleClaims.Any())
                {
                    roles = roleClaims.Select(c => c.Value).ToList();
                }
            }

            return Ok(new
            {
                // Request Info
                hasAuthorizationHeader = !string.IsNullOrEmpty(authHeader),
                authHeaderPreview = authHeader != null
                    ? authHeader.Substring(0, Math.Min(50, authHeader.Length)) + "..."
                    : "No token",
                authHeaderFormat = authHeader?.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) == true
                    ? "✅ Correct (Bearer {token})"
                    : "❌ Incorrect or missing",

                // Authentication Status
                isAuthenticated = user?.Identity?.IsAuthenticated ?? false,
                authenticationType = user?.Identity?.AuthenticationType ?? "None",
                identityName = user?.Identity?.Name ?? "Anonymous",

                // User Info
                userId = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "N/A",
                userName = user?.FindFirst(ClaimTypes.Name)?.Value ?? "N/A",
                email = user?.FindFirst(ClaimTypes.Email)?.Value ?? "N/A",

                // Claims
                claims = claims,
                claimsCount = claims.Count,

                // Roles
                roles = roles,
                rolesCount = roles.Count,

                // Configuration
                jwtConfig = new
                {
                    issuer = _configuration["Jwt:Issuer"],
                    audience = _configuration["Jwt:Audience"],
                    keyLength = _configuration["Jwt:Key"]?.Length ?? 0
                },

                // Note
                note = user?.Identity?.IsAuthenticated == false && !string.IsNullOrEmpty(authHeader)
                    ? "⚠️  Token is present but user is not authenticated. This endpoint has [AllowAnonymous]. Try /test-auth-simple instead."
                    : user?.Identity?.IsAuthenticated == true
                        ? "✅ User is authenticated! JWT is working correctly."
                        : "ℹ️  No token provided or token is invalid."
            });
        }

        /// <summary>
        /// Simple protected endpoint test
        /// </summary>
        [HttpGet("test-auth-simple")]
        [Authorize]
        public IActionResult TestAuthSimple()
        {
            var userId = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = User?.FindFirst(ClaimTypes.Name)?.Value;
            var email = User?.FindFirst(ClaimTypes.Email)?.Value;
            var isAuth = User?.Identity?.IsAuthenticated ?? false;

            Console.WriteLine("=== TEST AUTH SIMPLE ===");
            Console.WriteLine($"Authenticated: {isAuth}");
            Console.WriteLine($"User ID: {userId}");
            Console.WriteLine($"Username: {userName}");
            Console.WriteLine("=======================");

            return Ok(new
            {
                success = true,
                message = "✅ Authentication successful! JWT is working correctly.",
                isAuthenticated = isAuth,
                userId = userId,
                userName = userName,
                email = email,
                claimsCount = User?.Claims.Count() ?? 0,
                timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Full authentication details
        /// </summary>
        [HttpGet("test-auth")]
        [Authorize]
        public IActionResult TestAuth()
        {
            var userId = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = User?.Identity?.Name;
            var email = User?.FindFirst(ClaimTypes.Email)?.Value;

            Console.WriteLine("=== TEST AUTH FULL ===");
            Console.WriteLine($"User ID: {userId}");
            Console.WriteLine($"Username: {userName}");
            Console.WriteLine($"Claims: {User?.Claims.Count()}");

            if (User?.Claims != null)
            {
                foreach (var claim in User.Claims)
                {
                    Console.WriteLine($"  - {claim.Type}: {claim.Value}");
                }
            }

            Console.WriteLine("=====================");

            return Ok(new
            {
                success = true,
                message = "✅ Authentication successful!",
                userInfo = new
                {
                    userId = userId,
                    userName = userName,
                    email = email,
                    isAuthenticated = User?.Identity?.IsAuthenticated ?? false,
                    authenticationType = User?.Identity?.AuthenticationType
                },
                claims = User?.Claims.Select(c => new
                {
                    type = c.Type,
                    shortType = c.Type.Split('/').Last(),
                    value = c.Value
                }).ToList(),
                roles = User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList(),
                timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Test endpoint requiring specific role
        /// </summary>
        [HttpGet("test-admin")]
        [Authorize(Roles = "Admin")]
        public IActionResult TestAdmin()
        {
            var userId = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = User?.FindFirst(ClaimTypes.Name)?.Value;
            var roles = User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

            Console.WriteLine("=== TEST ADMIN ===");
            Console.WriteLine($"User: {userName} (ID: {userId})");
            Console.WriteLine($"Roles: {string.Join(", ", roles ?? new List<string>())}");
            Console.WriteLine("==================");

            return Ok(new
            {
                success = true,
                message = "✅ Admin access granted!",
                userId = userId,
                userName = userName,
                roles = roles,
                requiredRole = "Admin"
            });
        }

        /// <summary>
        /// Test endpoint requiring User or Admin role
        /// </summary>
        [HttpGet("test-user")]
        [Authorize(Roles = "User,Admin")]
        public IActionResult TestUser()
        {
            var userId = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = User?.FindFirst(ClaimTypes.Name)?.Value;
            var roles = User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

            return Ok(new
            {
                success = true,
                message = "✅ User/Admin access granted!",
                userId = userId,
                userName = userName,
                roles = roles,
                requiredRoles = new[] { "User", "Admin" }
            });
        }

        #endregion

        #region Complete Tests

        /// <summary>
        /// Run all tests in sequence
        /// </summary>
        [HttpGet("full-test")]
        [AllowAnonymous]
        public IActionResult FullTest()
        {
            var results = new List<object>();
            var startTime = DateTime.UtcNow;

            // Test 1: Config Check
            try
            {
                var configResult = ConfigCheck() as OkObjectResult;
                var configData = configResult?.Value as dynamic;

                results.Add(new
                {
                    test = "1. Configuration Check",
                    success = true,
                    message = "✅ Configuration loaded successfully"
                });
            }
            catch (Exception ex)
            {
                results.Add(new
                {
                    test = "1. Configuration Check",
                    success = false,
                    error = ex.Message
                });
            }

            // Test 2: Generate Token
            string? token = null;
            try
            {
                var generateResult = GenerateToken(new GenerateTokenRequest
                {
                    UserId = 999,
                    Username = "testuser",
                    Email = "test@example.com",
                    DisplayName = "Test User",
                    Roles = new List<string> { "User", "Admin" }
                }) as OkObjectResult;

                var tokenData = generateResult?.Value;
                var tokenProp = tokenData?.GetType().GetProperty("token");
                token = tokenProp?.GetValue(tokenData)?.ToString();

                results.Add(new
                {
                    test = "2. Generate Token",
                    success = !string.IsNullOrEmpty(token),
                    message = "✅ Token generated successfully",
                    tokenPreview = token?.Substring(0, Math.Min(50, token.Length)) + "..."
                });
            }
            catch (Exception ex)
            {
                results.Add(new
                {
                    test = "2. Generate Token",
                    success = false,
                    error = ex.Message
                });
            }

            // Test 3: Validate Token
            if (!string.IsNullOrEmpty(token))
            {
                try
                {
                    var validateResult = ValidateToken(new ValidateTokenRequest { Token = token });
                    var isValid = validateResult is OkObjectResult;

                    results.Add(new
                    {
                        test = "3. Validate Token",
                        success = isValid,
                        message = isValid ? "✅ Token validated successfully" : "❌ Token validation failed"
                    });
                }
                catch (Exception ex)
                {
                    results.Add(new
                    {
                        test = "3. Validate Token",
                        success = false,
                        error = ex.Message
                    });
                }
            }
            else
            {
                results.Add(new
                {
                    test = "3. Validate Token",
                    success = false,
                    message = "⏭️  Skipped - No token generated"
                });
            }

            var endTime = DateTime.UtcNow;
            var duration = endTime - startTime;

            var allSuccess = results.All(r =>
            {
                var successProp = r.GetType().GetProperty("success");
                return successProp?.GetValue(r) as bool? ?? false;
            });

            return Ok(new
            {
                overallSuccess = allSuccess,
                summary = allSuccess
                    ? "✅ All tests passed!"
                    : "❌ Some tests failed",
                totalTests = results.Count,
                passedTests = results.Count(r =>
                {
                    var successProp = r.GetType().GetProperty("success");
                    return successProp?.GetValue(r) as bool? ?? false;
                }),
                failedTests = results.Count(r =>
                {
                    var successProp = r.GetType().GetProperty("success");
                    return !(successProp?.GetValue(r) as bool? ?? false);
                }),
                duration = $"{duration.TotalMilliseconds}ms",
                timestamp = DateTime.UtcNow,
                tests = results,
                nextSteps = new
                {
                    step1 = "If all tests pass, copy the generated token",
                    step2 = "Click 'Authorize' button in Swagger",
                    step3 = "Enter: Bearer {token}",
                    step4 = "Test /test-auth-simple endpoint",
                    step5 = "Check backend console for detailed logs"
                }
            });
        }

        /// <summary>
        /// Quick test - Generate and validate token
        /// </summary>
        [HttpGet("quick-test")]
        [AllowAnonymous]
        public IActionResult QuickTest()
        {
            try
            {
                // Generate
                var generateResult = GenerateToken(new GenerateTokenRequest
                {
                    UserId = 1,
                    Username = "quicktest",
                    Email = "quicktest@example.com",
                    Roles = new List<string> { "User" }
                }) as OkObjectResult;

                var tokenData = generateResult?.Value;
                var token = tokenData?.GetType().GetProperty("token")?.GetValue(tokenData)?.ToString();

                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest(new { success = false, error = "Failed to generate token" });
                }

                // Validate
                var validateResult = ValidateToken(new ValidateTokenRequest { Token = token });
                var isValid = validateResult is OkObjectResult;

                return Ok(new
                {
                    success = isValid,
                    message = isValid ? "✅ Quick test passed!" : "❌ Quick test failed",
                    token = token,
                    tokenLength = token.Length,
                    isValid = isValid,
                    usage = $"Authorization: Bearer {token}",
                    testEndpoint = "/api/Debug/test-auth-simple"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }

        #endregion
    }

    #region Request Models

    public class GenerateTokenRequest
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? DisplayName { get; set; }
        public List<string>? Roles { get; set; }
    }

    public class GenerateTokenCustomRequest : GenerateTokenRequest
    {
        public int? ExpiresInMinutes { get; set; }
    }

    public class ValidateTokenRequest
    {
        public string Token { get; set; } = string.Empty;
    }

    #endregion
}