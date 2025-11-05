using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Hubs;
using MarketAnalysisBackend.Repositories.Implementations;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Implementations;
using MarketAnalysisBackend.Services.Interfaces;
using MarketAnalysisBackend.Services.Mocks;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();

// Database connection
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DbConnection"))
);

builder.Services.AddSignalR();
builder.Services.AddHttpClient();

// Repositories
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IPriceRepository, PriceRepository>();
builder.Services.AddScoped<IAssetRepository, AssetRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IWatchlistRepository, WatchlistRepository>();
builder.Services.AddScoped<INonceRepository, NonceRepository>();
builder.Services.AddScoped<IPriceCacheRepository, PriceCacheRepository>();
builder.Services.AddScoped<IGlobalAlertRepository, GlobalAlertRepository>();

// Services
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

// Background Services
//builder.Services.AddHostedService<AssetImporterService>();
//builder.Services.AddHostedService<PriceDataCollector>();
//builder.Services.AddHostedService<GlobalMetricService>();
//builder.Services.AddScoped<IGlobalAlertOrchestrationService, MockGlobalAlertOrchestrationService>();
builder.Services.AddHostedService<GlobalAlertDetectorService>();

// Google Authentication
var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Authentication:Jwt:Issuer"];
var jwtAudience = builder.Configuration["Authentication:Jwt:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie() 
.AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
{
    options.ClientId = googleClientId;
    options.ClientSecret = googleClientSecret;
    options.CallbackPath = "/signin-google"; 
    options.Scope.Add("profile");
    options.Scope.Add("email");
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!);
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200", "https://localhost:4200", "http://localhost:7175", "https://localhost:7175") // Angular dev server
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials()
                  .SetIsOriginAllowed(origin => true)
                  .WithExposedHeaders("*");
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");

app.MapHub<PriceHub>("/pricehub");
app.MapHub<GlobalMetric>("/globalmetrichub");
app.MapHub <AlertHub>("/alerthub");

app.UseAuthentication();
app.UseAuthorization();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
