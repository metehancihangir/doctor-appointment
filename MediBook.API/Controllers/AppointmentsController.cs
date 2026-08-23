using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediBook.API.Data;
using MediBook.API.DTOs.Appointment;
using MediBook.API.Models;
using MediBook.API.Services;


namespace MediBook.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize] // Randevu işlemleri için giriş yapılmış olması zorunludur
public class AppointmentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ISmsService _smsService;

    public AppointmentsController(AppDbContext context, ISmsService smsService)
    {
        _context = context;
        _smsService = smsService;
    }

    [HttpPost]
    [Authorize(Roles = "Patient,Admin")]
    public async Task<ActionResult<AppointmentResponseDto>> CreateAppointment(CreateAppointmentDto dto)
    {
        // 1. Hastanın kimliğini JWT'den al
        var patientIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (patientIdClaim == null) return Unauthorized();

        var userId = int.Parse(patientIdClaim);
        
        // 2. Hasta profiline eriş
        var patientProfile = await _context.PatientProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (patientProfile == null && User.IsInRole("Patient")) 
        {
             return BadRequest(new { message = "Hasta profili bulunamadı." });
        }

        // Admin ise test amaçlı profil kontrolünü bypass edebiliriz veya admin'in hasta profili olmadığını varsayabiliriz
        // Normalde id'yi direkt Users tablosundan patient olarak alacağız. Models.Appointment'da PatientId FK'si var,
        // ancak bu UserId'ye referans veriyor.
        // Wait, Let's check Appointment.cs: PatientId => User nesnesine işaret ediyor!
        // Models/Appointment.cs -> "public int PatientId { get; set; } public User Patient { get; set; }"
        // Demek ki PatientId, Users tablosundaki id.
        int finalPatientId = userId;

        // 3. Geçmişe randevu alınamaz
        var currentDateTime = DateTime.Now;
        var requestedDateTime = dto.AppointmentDate.Date + dto.AppointmentTime;
        
        if (requestedDateTime < currentDateTime)
        {
            return BadRequest(new { message = "Geçmiş bir tarihe randevu alınamaz." });
        }

        // 4. En az 2 saat sonrasına alınabilir
        if (requestedDateTime < currentDateTime.AddHours(2))
        {
            return BadRequest(new { message = "Randevu şu andan itibaren en az 2 saat sonrasına alınabilir." });
        }

        // 5. Doktor var mı?
        var doctor = await _context.DoctorProfiles
            .Include(d => d.Availabilities)
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == dto.DoctorId && d.User.IsActive);

        if (doctor == null) return NotFound(new { message = "Doktor bulunamadı." });

        // 6. Doktor o gün çalışıyor mu?
        var dayOfWeek = dto.AppointmentDate.DayOfWeek;
        var availability = doctor.Availabilities.FirstOrDefault(a => a.DayOfWeek == dayOfWeek);
        if (availability == null)
        {
            return BadRequest(new { message = "Doktor seçilen günde çalışmıyor." });
        }

        // 7. Saat dilimi doktorun çalışma saatleri içinde mi?
        if (dto.AppointmentTime < availability.StartTime || dto.AppointmentTime >= availability.EndTime)
        {
            return BadRequest(new { message = "Seçilen saat doktorun çalışma saatleri dışında." });
        }

        // 8. Slot dolu mu? (Doktorun başka randevusu var mı)
        var isSlotBooked = await _context.Appointments.AnyAsync(a => 
            a.DoctorId == dto.DoctorId && 
            a.AppointmentDate.Date == dto.AppointmentDate.Date && 
            a.AppointmentTime == dto.AppointmentTime &&
            a.Status != AppointmentStatus.Cancelled);

        if (isSlotBooked)
        {
            return Conflict(new { message = "Seçilen randevu saati maalesef dolu." });
        }

        // 9. Aynı hastanın o slota başka randevusu var mı?
        var hasPatientOtherAppointment = await _context.Appointments.AnyAsync(a => 
            a.PatientId == finalPatientId && 
            a.AppointmentDate.Date == dto.AppointmentDate.Date && 
            a.AppointmentTime == dto.AppointmentTime &&
            a.Status != AppointmentStatus.Cancelled);

        if (hasPatientOtherAppointment)
        {
            return BadRequest(new { message = "Aynı saat diliminde başka bir randevunuz bulunuyor." });
        }

        // 10. Randevuyu oluştur
        var appointment = new Appointment
        {
            PatientId = finalPatientId,
            DoctorId = dto.DoctorId,
            AppointmentDate = dto.AppointmentDate.Date,
            AppointmentTime = dto.AppointmentTime,
            Status = AppointmentStatus.Scheduled,
            Symptoms = dto.Symptoms,
            PatientNotes = dto.PatientNotes
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        var responseDto = new AppointmentResponseDto
        {
            Id = appointment.Id,
            DoctorName = $"{doctor.User.FirstName} {doctor.User.LastName}",
            Date = appointment.AppointmentDate,
            Time = appointment.AppointmentTime,
            Status = appointment.Status.ToString()
        };

        // SMS Bildirimi
        var patient = await _context.Users.FindAsync(finalPatientId);
        if (patient != null && !string.IsNullOrEmpty(patient.PhoneNumber))
        {
            var message = $"Sayın {patient.FirstName} {patient.LastName}, {appointment.AppointmentDate:dd.MM.yyyy} {appointment.AppointmentTime:hh\\:mm} tarihli Dr. {doctor.User.FirstName} {doctor.User.LastName} randevunuz oluşturulmuştur. - MediBook";
            // Fire and forget (Background queue'ya alınabilir ama await ile bekliyoruz ki DB logu oluşsun, hata yutulacak)
            await _smsService.SendAsync(patient.PhoneNumber, message, patient.Id, appointment.Id);
        }

        return CreatedAtAction(nameof(CreateAppointment), new { id = appointment.Id }, responseDto);
    }

    [HttpGet("my")]
    [Authorize(Roles = "Patient")]
    public async Task<ActionResult<object>> GetMyAppointments(
        [FromQuery] string? status, 
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10)
    {
        var patientIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (patientIdClaim == null) return Unauthorized();

        var userId = int.Parse(patientIdClaim);

        var query = _context.Appointments
            .Include(a => a.Doctor)
            .ThenInclude(d => d.User)
            .Where(a => a.PatientId == userId)
            .AsQueryable();

        // Filtreleme
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<AppointmentStatus>(status, out var parsedStatus))
        {
            query = query.Where(a => a.Status == parsedStatus);
        }

        if (startDate.HasValue)
        {
            query = query.Where(a => a.AppointmentDate >= startDate.Value.Date);
        }

        if (endDate.HasValue)
        {
            query = query.Where(a => a.AppointmentDate <= endDate.Value.Date);
        }

        // Sıralama (Yeniden eskiye)
        query = query.OrderByDescending(a => a.AppointmentDate).ThenByDescending(a => a.AppointmentTime);

        // Sayfalama
        var totalCount = await query.CountAsync();
        var appointments = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new PatientAppointmentDto
            {
                Id = a.Id,
                DoctorFullName = $"{a.Doctor.User.FirstName} {a.Doctor.User.LastName}",
                DoctorSpecialty = a.Doctor.Specialty,
                AppointmentDate = a.AppointmentDate,
                AppointmentTime = a.AppointmentTime,
                Status = a.Status.ToString(),
                Symptoms = a.Symptoms,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            Appointments = appointments,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpPut("{id}/cancel")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> CancelAppointment(int id)
    {
        var patientIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (patientIdClaim == null) return Unauthorized();

        var userId = int.Parse(patientIdClaim);

        var appointment = await _context.Appointments.FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null) 
            return NotFound(new { message = "Randevu bulunamadı." });

        if (appointment.PatientId != userId)
            return Forbid(); // Kendi randevusu değilse iptal edemez

        if (appointment.Status != AppointmentStatus.Scheduled && appointment.Status != AppointmentStatus.Confirmed)
        {
            return BadRequest(new { message = "Sadece planlanmış veya onaylanmış randevular iptal edilebilir." });
        }

        appointment.Status = AppointmentStatus.Cancelled;
        appointment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // SMS Bildirimi
        var patient = await _context.Users.FindAsync(appointment.PatientId);
        if (patient != null && !string.IsNullOrEmpty(patient.PhoneNumber))
        {
            var message = $"Sayın {patient.FirstName} {patient.LastName}, {appointment.AppointmentDate:dd.MM.yyyy} {appointment.AppointmentTime:hh\\:mm} tarihli randevunuz iptal edilmiştir. - MediBook";
            await _smsService.SendAsync(patient.PhoneNumber, message, patient.Id, appointment.Id);
        }

        return Ok(new { success = true, message = "Randevu iptal edildi." });
    }
}
