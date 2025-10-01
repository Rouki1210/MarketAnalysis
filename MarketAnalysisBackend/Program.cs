using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Repositories.Implementations;
using MarketAnalysisBackend.Repositories.Interfaces;
using MarketAnalysisBackend.Services.Implementations;
using MarketAnalysisBackend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DbConnection"))
);
//builder.Services.AddScoped<Supabase.Client>(sp =>
//{
//    var url = builder.Configuration["Supabase:Url"];
//    var key = builder.Configuration["Supabase:Key"];
//    return new Supabase.Client(url, key);
//});
builder.Services.AddHttpClient();

builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IPriceRepository, PriceRepository>();
builder.Services.AddScoped<IAssetRepository, AssetRepository>();

builder.Services.AddScoped<IAssetService, AssetService>();
builder.Services.AddScoped<IPriceService, PriceService>();
builder.Services.AddScoped<IAssetImport, AssetImporter>();

builder.Services.AddHostedService<AssetImporterService>();
builder.Services.AddHostedService<PriceDataCollector>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200") // Angular dev server
                  .AllowAnyHeader()
                  .AllowAnyMethod();
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

app.MapGet("/ping", () => "pong");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
