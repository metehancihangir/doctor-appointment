using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using MediBook.API.Data;
using MediBook.API.Models;

namespace MediBook.API.Services;

public class AppointmentReminderService : BackgroundService
{
    private readonly ILogger<AppointmentReminderService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1); // Saatte bir kontrol et

    public AppointmentReminderService(
        ILogger<AppointmentReminderService> logger,
        IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AppointmentReminderService başlatıldı.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndSendRemindersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Hatırlatmalar kontrol edilirken hata oluştu.");
            }

            // Bir sonraki kontrole kadar bekle
            await Task.Delay(_checkInterval, stoppingToken);
        }
    }

    private async Task CheckAndSendRemindersAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var smsService = scope.ServiceProvider.GetRequiredService<ISmsService>();

        var now = DateTime.UtcNow;
        var targetMin = now.AddHours(23); // 23 saat
        var targetMax = now.AddHours(25); // 25 saat

        // Yaklaşık 24 saat kalan randevuları bul (Scheduled veya Confirmed)
        var upcomingAppointments = await dbContext.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
                .ThenInclude(d => d.User)
            .Where(a => 
                !a.IsReminderSent &&
                (a.Status == AppointmentStatus.Scheduled || a.Status == AppointmentStatus.Confirmed)
            )
            .ToListAsync(stoppingToken);

        // Tarih ve saat hesaplaması C# tarafında yapılarak performans arttırılabilir
        var remindersToSend = upcomingAppointments.Where(a => 
        {
            var appointmentDateTime = a.AppointmentDate.Date.Add(a.AppointmentTime);
            return appointmentDateTime >= targetMin && appointmentDateTime <= targetMax;
        }).ToList();

        if (!remindersToSend.Any())
            return;

        _logger.LogInformation("{Count} adet randevu hatırlatması bulundu.", remindersToSend.Count);

        foreach (var appointment in remindersToSend)
        {
            if (string.IsNullOrEmpty(appointment.Patient?.PhoneNumber))
                continue;

            var patientName = $"{appointment.Patient.FirstName} {appointment.Patient.LastName}";
            var doctorName = $"{appointment.Doctor?.User?.FirstName} {appointment.Doctor?.User?.LastName}";
            var appointmentDateTime = appointment.AppointmentDate.Date.Add(appointment.AppointmentTime);

            var message = $"Sayın {patientName}, {appointmentDateTime:dd.MM.yyyy} {appointmentDateTime:HH:mm} tarihli Dr. {doctorName} randevunuzu hatırlatırız. Sağlıklı günler dileriz. - MediBook";

            // SMS Gönder (Hata olsa da try-catch blokları TwilioSmsService içinde handle ediliyor)
            await smsService.SendAsync(appointment.Patient.PhoneNumber, message, appointment.PatientId, appointment.Id);

            // Başarılı işaretle
            appointment.IsReminderSent = true;
        }

        await dbContext.SaveChangesAsync(stoppingToken);
    }
}
