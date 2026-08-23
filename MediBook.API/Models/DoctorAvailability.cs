using System;

namespace MediBook.API.Models;

public class DoctorAvailability
{
    public int Id { get; set; }
    
    // Yabancı anahtar
    public int DoctorId { get; set; }
    
    // Navigation property
    public DoctorProfile Doctor { get; set; }

    // 0 = Pazar, 1 = Pazartesi ... 6 = Cumartesi
    public DayOfWeek DayOfWeek { get; set; }
    
    public TimeSpan StartTime { get; set; } // Örn: 09:00
    public TimeSpan EndTime { get; set; }   // Örn: 17:00
}
