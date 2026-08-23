using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using MediBook.API.Data;
using MediBook.API.DTOs.Auth;
using MediBook.API.Models;
using MediBook.API.Services;

namespace MediBook.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthController(AppDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpGet("check-email")]
        public async Task<IActionResult> CheckEmail([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest(new { success = false, message = "Email zorunludur." });

            var exists = await _context.Users.AnyAsync(u => u.Email == email);
            return Ok(new { available = !exists });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { success = false, message = "Bu email adresi zaten kullanılıyor." });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = new User
                {
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Email = dto.Email,
                    PhoneNumber = dto.Phone,
                    Role = UserRole.Patient,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync(); // Get the generated UserId

                var patientProfile = new PatientProfile
                {
                    UserId = user.Id,
                    DateOfBirth = dto.DateOfBirth,
                    // Default values for other fields
                };

                _context.PatientProfiles.Add(patientProfile);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Created("", new { success = true, message = "Kayıt işlemi başarılı." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = "Kayıt sırasında bir hata oluştu.", errors = new[] { ex.Message } });
            }
        }

        [HttpPost("login")]
        [EnableRateLimiting("LoginPolicy")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || !user.IsActive || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new { success = false, message = "Geçersiz email veya şifre." });

            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshTokenString = _tokenService.GenerateRefreshToken();

            var refreshToken = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshTokenString,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            };

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            SetRefreshTokenCookie(refreshTokenString);

            var response = new AuthResponseDto
            {
                AccessToken = accessToken,
                Role = user.Role.ToString(),
                FullName = $"{user.FirstName} {user.LastName}",
                UserId = user.Id
            };

            return Ok(response);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var tokenStr = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(tokenStr))
                return Unauthorized(new { success = false, message = "Refresh token bulunamadı." });

            var existingToken = await _context.RefreshTokens
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == tokenStr);

            if (existingToken == null || existingToken.IsRevoked || existingToken.ExpiresAt <= DateTime.UtcNow)
                return Unauthorized(new { success = false, message = "Geçersiz veya süresi dolmuş refresh token." });

            var user = existingToken.User;
            if (user == null || !user.IsActive)
                return Unauthorized(new { success = false, message = "Kullanıcı aktif değil." });

            // Eski token'ı geçersiz kıl
            existingToken.IsRevoked = true;

            // Yeni tokenlar üret
            var newAccessToken = _tokenService.GenerateAccessToken(user);
            var newRefreshTokenString = _tokenService.GenerateRefreshToken();

            var newRefreshToken = new RefreshToken
            {
                UserId = user.Id,
                Token = newRefreshTokenString,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            };

            _context.RefreshTokens.Add(newRefreshToken);
            await _context.SaveChangesAsync();

            SetRefreshTokenCookie(newRefreshTokenString);

            var response = new AuthResponseDto
            {
                AccessToken = newAccessToken,
                Role = user.Role.ToString(),
                FullName = $"{user.FirstName} {user.LastName}",
                UserId = user.Id
            };

            return Ok(response);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var tokenStr = Request.Cookies["refreshToken"];
            if (!string.IsNullOrEmpty(tokenStr))
            {
                var existingToken = await _context.RefreshTokens.FirstOrDefaultAsync(r => r.Token == tokenStr);
                if (existingToken != null)
                {
                    existingToken.IsRevoked = true;
                    await _context.SaveChangesAsync();
                }
            }

            Response.Cookies.Delete("refreshToken");
            return Ok(new { success = true, message = "Çıkış başarılı." });
        }

        private void SetRefreshTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7),
                SameSite = SameSiteMode.Strict,
                Secure = Request.IsHttps
            };
            Response.Cookies.Append("refreshToken", token, cookieOptions);
        }
    }
}
