using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MediBook.API.Data;
using MediBook.API.DTOs.Doctor;
using MediBook.API.Models;

namespace MediBook.API.Controllers;

[ApiController]
[Route("api/v1/doctor")]
[Authorize(Roles = "Doctor")]
public class DoctorAppointmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DoctorAppointmentsController(AppDbContext context)
    {
        _context = context;
    }

    private int GetDoctorIdFromToken()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return 0;
        
        var userId = int.Parse(userIdString);
        var doctorProfile = _context.DoctorProfiles.FirstOrDefault(d => d.UserId == userId);
        return doctorProfile?.Id ?? 0;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DoctorStatsDto>> GetStats()
    {
        var doctorId = GetDoctorIdFromToken();
        if (doctorId == 0) return Forbid();

        var today = DateTime.UtcNow.Date;

        var allAppointments = await _context.Appointments
            .Where(a => a.DoctorId == doctorId)
            .ToListAsync();

        var stats = new DoctorStatsDto
        {
            TotalCount = allAppointments.Count,
            TodayCount = allAppointments.Count(a => a.AppointmentDate.Date == today),
            PendingCount = allAppointments.Count(a => a.Status == AppointmentStatus.Scheduled || a.Status == AppointmentStatus.Confirmed),
            CompletedCount = allAppointments.Count(a => a.Status == AppointmentStatus.Completed)
        };

        return Ok(stats);
    }

    [HttpGet("appointments")]
    public async Task<ActionResult<object>> GetAppointments(
        [FromQuery] string? status, 
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10)
    {
        var doctorId = GetDoctorIdFromToken();
        if (doctorId == 0) return Forbid();

        var query = _context.Appointments
            .Include(a => a.Patient)
            .Where(a => a.DoctorId == doctorId)
            .AsQueryable();

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

        query = query.OrderByDescending(a => a.AppointmentDate).ThenByDescending(a => a.AppointmentTime);

        var totalCount = await query.CountAsync();

        // Hastanın doğum tarihini alabilmek için PatientProfiles ile birleştireceğiz
        var appointmentsList = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var patientIds = appointmentsList.Select(a => a.PatientId).Distinct().ToList();
        var patientProfiles = await _context.PatientProfiles
            .Where(p => patientIds.Contains(p.UserId))
            .ToDictionaryAsync(p => p.UserId);

        var dtos = appointmentsList.Select(a => {
            var dob = patientProfiles.ContainsKey(a.PatientId) ? patientProfiles[a.PatientId].DateOfBirth : DateTime.UtcNow;
            var age = DateTime.UtcNow.Year - dob.Year;
            if (dob.Date > DateTime.UtcNow.AddYears(-age)) age--;

            return new DoctorAppointmentDto
            {
                Id = a.Id,
                PatientFullName = $"{a.Patient.FirstName} {a.Patient.LastName}",
                PatientPhone = a.Patient.PhoneNumber,
                PatientAge = age,
                AppointmentDate = a.AppointmentDate,
                AppointmentTime = a.AppointmentTime,
                Status = a.Status.ToString(),
                Symptoms = a.Symptoms,
                PatientNotes = a.PatientNotes,
                DoctorNotes = a.DoctorNotes,
                Diagnosis = a.Diagnosis
            };
        }).ToList();

        return Ok(new
        {
            Appointments = dtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpPut("appointments/{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateAppointmentStatusDto request)
    {
        var doctorId = GetDoctorIdFromToken();
        if (doctorId == 0) return Forbid();

        var appointment = await _context.Appointments.FirstOrDefaultAsync(a => a.Id == id);
        if (appointment == null) return NotFound(new { message = "Randevu bulunamadı." });
        if (appointment.DoctorId != doctorId) return Forbid();

        // Durum geçiş validasyonları
        if (appointment.Status == AppointmentStatus.Completed || appointment.Status == AppointmentStatus.Cancelled)
        {
            return BadRequest(new { message = "Tamamlanmış veya iptal edilmiş randevular değiştirilemez." });
        }

        if (appointment.Status == AppointmentStatus.Scheduled)
        {
            if (request.Status != AppointmentStatus.Confirmed && request.Status != AppointmentStatus.Cancelled)
                return BadRequest(new { message = "Planlanmış randevu sadece Onaylandı veya İptal Edildi olarak değiştirilebilir." });
        }
        else if (appointment.Status == AppointmentStatus.Confirmed)
        {
            if (request.Status != AppointmentStatus.Completed && request.Status != AppointmentStatus.Cancelled)
                return BadRequest(new { message = "Onaylanmış randevu sadece Tamamlandı veya İptal Edildi olarak değiştirilebilir." });
        }

        appointment.Status = request.Status;
        appointment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Durum başarıyla güncellendi." });
    }

    [HttpPut("appointments/{id}/notes")]
    public async Task<IActionResult> UpdateNotes(int id, [FromBody] UpdateDoctorNotesDto request)
    {
        var doctorId = GetDoctorIdFromToken();
        if (doctorId == 0) return Forbid();

        var appointment = await _context.Appointments.FirstOrDefaultAsync(a => a.Id == id);
        if (appointment == null) return NotFound(new { message = "Randevu bulunamadı." });
        if (appointment.DoctorId != doctorId) return Forbid();

        appointment.DoctorNotes = request.DoctorNotes;
        appointment.Diagnosis = request.Diagnosis;
        appointment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Klinik notlar başarıyla güncellendi." });
    }
}
