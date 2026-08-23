using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MediBook.API.Data;
using MediBook.API.Middleware;
using MediBook.API.Services;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using FluentValidation;
using FluentValidation.AspNetCore;
using Serilog;
using Microsoft.AspNetCore.Mvc;
using MediBook.API.Common;

var builder = WebApplication.CreateBuilder(args);

// ─── Serilog Yapılandırması ────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Warning() // Sadece Warning ve üzeri hatalar (Hata Yönetimi fazına uygun)
    .WriteTo.Console()
    .WriteTo.File($"logs/medibook-{DateTime.Now:yyyy-MM-dd}.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// ─── Veritabanı ────────────────────────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("'DefaultConnection' bağlantı dizesi bulunamadı.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// ─── CORS (Frontend: http://localhost:5173) ─────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Refresh token HttpOnly cookie için gerekli
    });
});

// ─── JWT Kimlik Doğrulama ──────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key yapılandırması bulunamadı.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero // Token süresini kesin olarak uygula
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddScoped<ITokenService, TokenService>();

// ─── Rate Limiting (Login Endpoint) ─────────────────────────────────────────
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("LoginPolicy", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(15);
        opt.PermitLimit = 5;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsJsonAsync(new { success = false, message = "Çok fazla giriş denemesi yaptınız. Lütfen 15 dakika sonra tekrar deneyin.", errors = Array.Empty<string>() }, cancellationToken: token);
    };
});

// ─── Controller & OpenAPI (built-in .NET 10) ──────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        // FluentValidation ve ModelState hatalarını standart API yanıtına dönüştür
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value.Errors.Count > 0)
                .SelectMany(x => x.Value.Errors)
                .Select(x => x.ErrorMessage)
                .ToList();

            var response = ApiResponse.Fail("Doğrulama hatası", errors);
            return new BadRequestObjectResult(response);
        };
    });

// ─── FluentValidation ──────────────────────────────────────────────────────
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddOpenApi();

// ─── Uygulama Pipeline ─────────────────────────────────────────────────────
builder.Services.AddScoped<ISmsService, TwilioSmsService>();
builder.Services.AddHostedService<AppointmentReminderService>();

var app = builder.Build();

// Global hata yakalama middleware'i (pipeline'ın en başında olmalı)
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // /openapi/v1.json endpoint'i
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseCors("FrontendPolicy");

// app.UseRateLimiter(); // Şimdilik devre dışı bırakıldı

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Eşleşmeyen tüm route'lar için 404 yanıtı
app.MapFallback(async (context) =>
{
    context.Response.StatusCode = 404;
    context.Response.ContentType = "application/json";
    var response = new { success = false, message = "Endpoint bulunamadı.", errors = Array.Empty<string>() };
    await context.Response.WriteAsJsonAsync(response);
});

app.Run();
