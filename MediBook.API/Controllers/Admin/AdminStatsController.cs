using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediBook.API.Data;
using MediBook.API.DTOs.Admin;
using MediBook.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MediBook.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/stats")]
[Authorize(Roles = "Admin")]
public class AdminStatsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminStatsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<AdminStatsDto>> GetStats()
    {
        var totalPatients = await _context.Users.CountAsync(u => u.Role == UserRole.Patient);
        var totalDoctors = await _context.Users.CountAsync(u => u.Role == UserRole.Doctor);
        var totalAppointments = await _context.Appointments.CountAsync();
        
        var today = DateTime.UtcNow.Date;
        var todayAppointments = await _context.Appointments
            .CountAsync(a => a.AppointmentDate.Date == today);

        return Ok(new AdminStatsDto
        {
            TotalPatients = totalPatients,
            TotalDoctors = totalDoctors,
            TotalAppointments = totalAppointments,
            TodayAppointments = todayAppointments
        });
    }

    [HttpGet("daily")]
    public async Task<ActionResult<List<DailyAppointmentStatDto>>> GetDailyStats([FromQuery] int days = 7)
    {
        var endDate = DateTime.UtcNow.Date;
        var startDate = endDate.AddDays(-days + 1);

        var appointments = await _context.Appointments
            .Where(a => a.AppointmentDate.Date >= startDate && a.AppointmentDate.Date <= endDate)
            .ToListAsync();

        var stats = new List<DailyAppointmentStatDto>();

        for (int i = 0; i < days; i++)
        {
            var date = startDate.AddDays(i);
            var dailyAppointments = appointments.Where(a => a.AppointmentDate.Date == date).ToList();

            stats.Add(new DailyAppointmentStatDto
            {
                Date = date,
                Total = dailyAppointments.Count,
                Completed = dailyAppointments.Count(a => a.Status == AppointmentStatus.Completed),
                Cancelled = dailyAppointments.Count(a => a.Status == AppointmentStatus.Cancelled)
            });
        }

        return Ok(stats);
    }
}
