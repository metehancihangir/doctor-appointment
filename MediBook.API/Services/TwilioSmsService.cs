using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
using MediBook.API.Data;
using MediBook.API.Models;

namespace MediBook.API.Services;

public class TwilioSmsService : ISmsService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<TwilioSmsService> _logger;
    private readonly IServiceProvider _serviceProvider;

    public TwilioSmsService(
        IConfiguration configuration,
        ILogger<TwilioSmsService> logger,
        IServiceProvider serviceProvider)
    {
        _configuration = configuration;
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    public async Task SendAsync(string toNumber, string messageBody, int userId, int? appointmentId = null)
    {
        // SmsLog tablosuna kayıt atacağımız için scoped DbContext'i alıyoruz.
        // Background servisleri veya Controller'lar tetiklediğinde lifecycle sorunlarını aşmak için IServiceProvider kullanıyoruz.
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var smsLog = new SmsLog
        {
            UserId = userId,
            AppointmentId = appointmentId,
            Message = messageBody,
            SentAt = DateTime.UtcNow
        };

        try
        {
            var accountSid = _configuration["Twilio:AccountSid"];
            var authToken = _configuration["Twilio:AuthToken"];
            var fromNumber = _configuration["Twilio:FromNumber"];

            if (string.IsNullOrEmpty(accountSid) || string.IsNullOrEmpty(authToken))
            {
                throw new Exception("Twilio ayarları bulunamadı.");
            }

            // Fake config olup olmadığını kontrol edelim. Fake ise sadece db'ye yazalım
            if (accountSid.Contains("FAKE_"))
            {
                _logger.LogInformation("Fake Twilio config tespit edildi. SMS sadece DB'ye loglandı: {Message}", messageBody);
                smsLog.IsSuccess = true;
            }
            else
            {
                TwilioClient.Init(accountSid, authToken);

                var message = await MessageResource.CreateAsync(
                    body: messageBody,
                    from: new PhoneNumber(fromNumber),
                    to: new PhoneNumber(toNumber)
                );

                smsLog.IsSuccess = true;
                _logger.LogInformation("SMS başarıyla gönderildi: {Sid}", message.Sid);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMS gönderimi sırasında hata oluştu. To: {ToNumber}", toNumber);
            smsLog.IsSuccess = false;
            smsLog.ErrorMessage = ex.Message.Length > 500 ? ex.Message.Substring(0, 500) : ex.Message;
        }
        finally
        {
            // Hata olsa da olmasa da logu kaydet
            dbContext.SmsLogs.Add(smsLog);
            await dbContext.SaveChangesAsync();
        }
    }
}
