using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediBook.API.Data;
using MediBook.API.DTOs.Doctor;
using MediBook.API.Models;

namespace MediBook.API.Controllers;

[Route("api/v1/[controller]")]
[ApiController]
public class DoctorsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DoctorsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<DoctorListResponseDto>> GetDoctors(
        [FromQuery] string? search,
        [FromQuery] string? specialty,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        // Query'yi oluştur
        var query = _context.DoctorProfiles
            .Include(d => d.User)
            .Where(d => d.User.IsActive && d.User.Role == UserRole.Doctor)
            .AsQueryable();

        // Specialty'ye göre filtrele
        if (!string.IsNullOrWhiteSpace(specialty))
        {
            query = query.Where(d => d.Specialty == specialty);
        }

        // İsme göre filtrele
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(d => 
                EF.Functions.Like(d.User.FirstName, $"%{search}%") || 
                EF.Functions.Like(d.User.LastName, $"%{search}%"));
        }

        // Toplam sayıyı al
        var totalCount = await query.CountAsync();

        // Sayfalama
        var doctors = await query
            .OrderBy(d => d.User.FirstName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DoctorListItemDto
            {
                DoctorId = d.Id,
                UserId = d.UserId,
                FullName = $"{d.User.FirstName} {d.User.LastName}",
                Specialty = d.Specialty,
                YearsOfExperience = d.YearsOfExperience
            })
            .ToListAsync();

        return Ok(new DoctorListResponseDto
        {
            Doctors = doctors,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }
}
