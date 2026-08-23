using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MediBook.API.Data;
using MediBook.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

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

// ─── Controller & OpenAPI (built-in .NET 10) ──────────────────────────────
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// ─── Uygulama Pipeline ─────────────────────────────────────────────────────
var app = builder.Build();

// Global hata yakalama middleware'i (pipeline'ın en başında olmalı)
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // /openapi/v1.json endpoint'i
}

app.UseCors("FrontendPolicy");

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
