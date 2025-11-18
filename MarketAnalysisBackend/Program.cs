using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Hubs;
using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Repositories.Implementations;
using MarketAnalysisBackend.Repositories.Implementations.Community;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Repositories.Interfaces.Community;
using MarketAnalysisBackend.Services;
using MarketAnalysisBackend.Services.Implementations;
using MarketAnalysisBackend.Services.Implementations.Community;
using MarketAnalysisBackend.Services.Implementations.Worker;
using MarketAnalysisBackend.Services.Interfaces;
using MarketAnalysisBackend.Services.Interfaces.Community;
using MarketAnalysisBackend.Services.Mocks;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OpenAI.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

// ============================================================================
// JWT CLAIM TYPE MAPPING CONFIGURATION
// ============================================================================
// CRITICAL: Clear the default inbound claim type mapping to prevent ASP.NET Core
// from automatically transforming claim types. Without this, JWT claims like "role"
// might get mapped to long URIs, causing authorization to fail.
// This ensures claims in the JWT token are preserved exactly as generated.
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

// ============================================================================
// CONTROLLERS & API DOCUMENTATION
// ============================================================================

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT authentication support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Market Analysis Backend API",
        Version = "v1",
        Description = "Cryptocurrency market analysis platform with AI-powered insights"
    });

    // Add JWT Bearer authentication to Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. " +
                      "Enter 'Bearer' [space] and then your token in the text input below. " +
                      "Example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddHttpContextAccessor();

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DbConnection"))
);

// ============================================================================
// AI & CACHING SERVICES
// ============================================================================

builder.Services.Configure<OpenAISettings>(
    builder.Configuration.GetSection("OpenAI")
);
builder.Services.AddMemoryCache();
builder.Services.AddScoped<IAiAnalysisService, AiAnalysisService>();

// ============================================================================
// SIGNALR & HTTP CLIENT
// ============================================================================

builder.Services.AddSignalR();
builder.Services.AddHttpClient();

// ============================================================================
// REPOSITORY REGISTRATION
// ============================================================================

// Generic Repository
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

// Core Repositories
builder.Services.AddScoped<IPriceRepository, PriceRepository>();
builder.Services.AddScoped<IAssetRepository, AssetRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IWatchlistRepository, WatchlistRepository>();
builder.Services.AddScoped<INonceRepository, NonceRepository>();
builder.Services.AddScoped<IPriceCacheRepository, PriceCacheRepository>();
builder.Services.AddScoped<IGlobalAlertRepository, GlobalAlertRepository>();

// Community Repositories
builder.Services.AddScoped<ICommunityPostRepository, CommunityPostRepository>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();
builder.Services.AddScoped<IPostReactionRepository, PostReactionRepository>();
builder.Services.AddScoped<IPostBookmarkRepository, PostBookmarkRepository>();
builder.Services.AddScoped<IPostTagRepository, PostTagRepository>();
builder.Services.AddScoped<ICommunityNotificationRepository, CommunityNotificationRepository>();
builder.Services.AddScoped<IUserFollowRepository, UserFollowRepository>();
builder.Services.AddScoped<IArticleRepository, ArticleRepository>();
builder.Services.AddScoped<ITopicRepository, TopicRepository>();
builder.Services.AddScoped<IPostTopicRepository, PostTopicRepository>();
builder.Services.AddScoped<ITopicFollowRepository, TopicFollowRepository>();

// ============================================================================
// SERVICE REGISTRATION
// ============================================================================

// Core Services
builder.Services.AddScoped<IAssetService, AssetService>();
builder.Services.AddScoped<IPriceService, PriceService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAssetImport, AssetImporter>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IWalletService, WalletService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();
builder.Services.AddScoped<IWatchlistService, WatchlistService>();
builder.Services.AddScoped<IPriceCacheService, PriceCacheService>();
builder.Services.AddScoped<IAlertEvaluationService, AlertEvaluationService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IGlobalAlertOrchestrationService, GlobalAlertOrchestrationService>();

// Community Services
builder.Services.AddScoped<ICommunityPostService, CommunityPostService>();
builder.Services.AddScoped<ICommunityNotificationService, CommunityNotificationService>();
builder.Services.AddScoped<IUserFollowService, UserFollowService>();
builder.Services.AddScoped<ITopicService, TopicService>();
builder.Services.AddScoped<IArticleService, ArticleService>();
builder.Services.AddScoped<IRoleService, RoleService>();

// ============================================================================
// BACKGROUND SERVICES (Currently Disabled)
// ============================================================================
// Uncomment to enable background data collection and processing
// builder.Services.AddHostedService<AssetImporterService>();
// builder.Services.AddHostedService<PriceDataCollector>();
// builder.Services.AddHostedService<GlobalMetricService>();
// builder.Services.AddHostedService<GlobalAlertDetectorService>();

// ============================================================================
// AUTHENTICATION CONFIGURATION
// ============================================================================

// Load authentication configuration
var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

// Configure authentication with JWT as primary scheme
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var key = Encoding.UTF8.GetBytes(jwtKey!);

    options.TokenValidationParameters = new TokenValidationParameters
    {
        // Validate token signature
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),

        // Validate issuer and audience
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,

        // Validate token expiration
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero, // No tolerance for expired tokens

        // CRITICAL: Explicitly specify which claim types to use for roles and names
        // This ensures RequireRoleAttribute can find role claims correctly
        RoleClaimType = System.Security.Claims.ClaimTypes.Role,
        NameClaimType = System.Security.Claims.ClaimTypes.Name
    };

    // JWT Bearer Events for debugging and SignalR support
    options.Events = new JwtBearerEvents
    {
        // Extract token from query string for SignalR connections
        // SignalR uses WebSockets which cannot send Authorization headers
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/pricehub") ||
                 path.StartsWithSegments("/globalmetrichub") ||
                 path.StartsWithSegments("/alerthub")))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        },

        // Log successful token validation
        OnTokenValidated = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            var userId = context.Principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var roles = context.Principal?.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value);

            logger.LogInformation(
                "✅ JWT token validated successfully - User: {UserId}, Roles: [{Roles}]",
                userId ?? "Unknown",
                roles != null ? string.Join(", ", roles) : "None"
            );

            return Task.CompletedTask;
        },

        // Log authentication failures
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError(
                "❌ JWT authentication failed - Error: {Error}, Exception: {Exception}",
                context.Exception.Message,
                context.Exception.GetType().Name
            );

            return Task.CompletedTask;
        },

        // Log when authentication is challenged (missing/invalid token)
        OnChallenge = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogWarning(
                "⚠️ JWT authentication challenge - Path: {Path}, Error: {Error}",
                context.HttpContext.Request.Path,
                context.ErrorDescription ?? "No token provided"
            );

            return Task.CompletedTask;
        }
    };
})
.AddCookie() // For session-based authentication (Google OAuth callback)
.AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
{
    options.ClientId = googleClientId!;
    options.ClientSecret = googleClientSecret!;
    options.CallbackPath = "/signin-google";
    options.Scope.Add("profile");
    options.Scope.Add("email");
});

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ============================================================================
// BUILD APPLICATION
// ============================================================================

var app = builder.Build();

// ============================================================================
// DATABASE SEEDING (Currently Disabled)
// ============================================================================
// Uncomment to seed default roles on startup
// using (var scope = app.Services.CreateScope())
// {
//     try
//     {
//         var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
//         await RoleSeeder.SeedAsync(context);
//     }
//     catch (Exception ex)
//     {
//         var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
//         logger.LogError(ex, "Error seeding roles to database");
//     }
// }

// ============================================================================
// HTTP REQUEST PIPELINE CONFIGURATION
// ============================================================================

// Enable Swagger in development environment
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Market Analysis API v1");
        c.RoutePrefix = "swagger"; // Access Swagger at /swagger
    });
}

// HTTPS redirection
app.UseHttpsRedirection();

// CORS - Must come before Authentication/Authorization
app.UseCors("AllowAngular");

// Authentication & Authorization - Order is critical!
// UseAuthentication MUST come before UseAuthorization
app.UseAuthentication();
app.UseAuthorization();

// SignalR Hub endpoints
app.MapHub<PriceHub>("/pricehub");
app.MapHub<GlobalMetric>("/globalmetrichub");
app.MapHub<AlertHub>("/alerthub");

// API Controllers
app.MapControllers();

// ============================================================================
// RUN APPLICATION
// ============================================================================

app.Run();
