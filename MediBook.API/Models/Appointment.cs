using System;

namespace MediBook.API.Models;

public class Appointment
{
    public int Id { get; set; }
    
    // Yabancı anahtarlar
    public int PatientId { get; set; }
    public User Patient { get; set; }

    public int DoctorId { get; set; }
    public DoctorProfile Doctor { get; set; }

    // Tarih ve Zaman
    public DateTime AppointmentDate { get; set; } // Tarih (Saat kısmı sıfırlanmış olarak kullanılacak)
    public TimeSpan AppointmentTime { get; set; } // Sadece saat kısmı

    // Durum
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;

    // Notlar ve Detaylar
    public string? Symptoms { get; set; }
    public string? PatientNotes { get; set; }
    public string? DoctorNotes { get; set; }
    public string? Diagnosis { get; set; }

    public bool IsReminderSent { get; set; } = false;

    // Denetim alanları
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
