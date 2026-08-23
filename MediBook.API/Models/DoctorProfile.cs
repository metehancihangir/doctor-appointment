namespace MediBook.API.Models;

public class DoctorProfile
{
    public int Id { get; set; }
    
    // Yabancı anahtar (Foreign Key)
    public int UserId { get; set; }
    
    // Navigation property
    public User User { get; set; }

    public string Specialty { get; set; } // Örn: Kardiyoloji, Pediatri
    public string? Bio { get; set; }
    public int YearsOfExperience { get; set; }

    // Navigation property
    public ICollection<DoctorAvailability> Availabilities { get; set; } = new List<DoctorAvailability>();
}
