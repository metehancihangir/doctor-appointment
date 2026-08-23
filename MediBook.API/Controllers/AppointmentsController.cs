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

namespace MediBook.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize] // Randevu işlemleri için giriş yapılmış olması zorunludur
public class AppointmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AppointmentsController(AppDbContext context)
    {
        _context = context;
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

        return CreatedAtAction(nameof(CreateAppointment), new { id = appointment.Id }, responseDto);
    }
}
