using System;

namespace MediBook.API.Models;

public class SmsLog
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? AppointmentId { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    
    // Navigation properties
    public User? User { get; set; }
    public Appointment? Appointment { get; set; }
}
