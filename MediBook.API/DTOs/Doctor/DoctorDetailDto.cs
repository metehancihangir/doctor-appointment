using System;
using System.Collections.Generic;

namespace MediBook.API.DTOs.Doctor;

public class DoctorDetailDto
{
    public int DoctorId { get; set; }
    public string FullName { get; set; }
    public string Specialty { get; set; }
    public int YearsOfExperience { get; set; }
    public string? Bio { get; set; }
    
    // Çalıştığı günler (0=Pazar, 1=Pzt...)
    public List<int> AvailableDays { get; set; } = new List<int>();
}
