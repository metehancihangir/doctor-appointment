using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediBook.API.Data;
using MediBook.API.DTOs.Admin;
using MediBook.API.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MediBook.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/doctors")]
[Authorize(Roles = "Admin")]
public class AdminDoctorsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminDoctorsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateDoctor([FromBody] CreateDoctorRequestDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { message = "Bu email adresi zaten kullanımda." });
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PhoneNumber = request.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = UserRole.Doctor,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var doctorProfile = new DoctorProfile
            {
                UserId = user.Id,
                Specialty = request.Specialty,
                YearsOfExperience = request.YearsOfExperience,
                Bio = request.Bio
            };

            _context.DoctorProfiles.Add(doctorProfile);
            await _context.SaveChangesAsync();

            if (request.Availability != null && request.Availability.Any())
            {
                var availabilities = request.Availability.Select(a => new DoctorAvailability
                {
                    DoctorId = doctorProfile.Id,
                    DayOfWeek = a.DayOfWeek,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime
                }).ToList();

                _context.DoctorAvailabilities.AddRange(availabilities);
                await _context.SaveChangesAsync();
            }

            await transaction.CommitAsync();
            return Ok(new { message = "Doktor başarıyla oluşturuldu." });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Doktor oluşturulurken bir hata oluştu.", error = ex.Message });
        }
    }
}
