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

    [HttpGet("{id}")]
    public async Task<ActionResult<DoctorDetailDto>> GetDoctor(int id)
    {
        var doctor = await _context.DoctorProfiles
            .Include(d => d.User)
            .Include(d => d.Availabilities)
            .FirstOrDefaultAsync(d => d.Id == id && d.User.IsActive && d.User.Role == UserRole.Doctor);

        if (doctor == null) return NotFound(new { message = "Doktor bulunamadı." });

        var dto = new DoctorDetailDto
        {
            DoctorId = doctor.Id,
            FullName = $"{doctor.User.FirstName} {doctor.User.LastName}",
            Specialty = doctor.Specialty,
            YearsOfExperience = doctor.YearsOfExperience,
            Bio = doctor.Bio,
            AvailableDays = doctor.Availabilities.Select(a => (int)a.DayOfWeek).Distinct().ToList()
        };

        return Ok(dto);
    }

    [HttpGet("{id}/slots")]
    public async Task<ActionResult<List<TimeSlotDto>>> GetAvailableSlots(int id, [FromQuery] DateTime date)
    {
        // 1. Doktor ve çalışma saatlerini bul
        var dayOfWeek = date.DayOfWeek;
        
        var doctor = await _context.DoctorProfiles
            .Include(d => d.Availabilities)
            .FirstOrDefaultAsync(d => d.Id == id && d.User.IsActive && d.User.Role == UserRole.Doctor);

        if (doctor == null) return NotFound(new { message = "Doktor bulunamadı." });

        var availability = doctor.Availabilities.FirstOrDefault(a => a.DayOfWeek == dayOfWeek);
        if (availability == null)
        {
            // O gün çalışmıyor
            return Ok(new List<TimeSlotDto>());
        }

        // 2. O güne ait randevuları getir
        var appointments = await _context.Appointments
            .Where(a => a.DoctorId == id && 
                        a.AppointmentDate.Date == date.Date && 
                        a.Status != AppointmentStatus.Cancelled)
            .Select(a => a.AppointmentTime)
            .ToListAsync();

        // 3. Slotları oluştur (30 dk)
        var slots = new List<TimeSlotDto>();
        var currentSlot = availability.StartTime;

        while (currentSlot < availability.EndTime)
        {
            // Eğer saat bugünse ve geçmişteyse, IsAvailable = false
            bool isPast = (date.Date == DateTime.Today && currentSlot < DateTime.Now.TimeOfDay);
            
            // Eğer o slota ait randevu varsa, IsAvailable = false
            bool isBooked = appointments.Contains(currentSlot);

            slots.Add(new TimeSlotDto
            {
                Time = currentSlot,
                IsAvailable = !isPast && !isBooked
            });

            currentSlot = currentSlot.Add(TimeSpan.FromMinutes(30));
        }

        return Ok(slots);
    }
}
