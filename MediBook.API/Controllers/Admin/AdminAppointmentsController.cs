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
[Route("api/v1/admin/appointments")]
[Authorize(Roles = "Admin")]
public class AdminAppointmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminAppointmentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetAppointments(
        [FromQuery] string? status,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? doctor,
        [FromQuery] string? patient,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .ThenInclude(d => d.User)
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

        if (!string.IsNullOrEmpty(doctor))
        {
            query = query.Where(a => (a.Doctor.User.FirstName + " " + a.Doctor.User.LastName).Contains(doctor));
        }

        if (!string.IsNullOrEmpty(patient))
        {
            query = query.Where(a => (a.Patient.FirstName + " " + a.Patient.LastName).Contains(patient));
        }

        query = query.OrderByDescending(a => a.AppointmentDate).ThenByDescending(a => a.AppointmentTime);

        var totalCount = await query.CountAsync();

        var appointments = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                Id = a.Id,
                PatientFullName = $"{a.Patient.FirstName} {a.Patient.LastName}",
                DoctorFullName = $"{a.Doctor.User.FirstName} {a.Doctor.User.LastName}",
                AppointmentDate = a.AppointmentDate,
                AppointmentTime = a.AppointmentTime,
                Status = a.Status.ToString()
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

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateAppointmentStatusDto request)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null) return NotFound(new { message = "Randevu bulunamadı." });

        appointment.Status = request.Status;
        appointment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Randevu durumu admin tarafından güncellendi." });
    }
}

public class UpdateAppointmentStatusDto
{
    public AppointmentStatus Status { get; set; }
}
