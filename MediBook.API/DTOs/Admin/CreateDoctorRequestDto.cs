using System.Collections.Generic;

namespace MediBook.API.DTOs.Admin;

public class CreateDoctorRequestDto
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string Password { get; set; }
    public string Specialty { get; set; }
    public int YearsOfExperience { get; set; }
    public string? Bio { get; set; }
    public List<AvailabilityDto> Availability { get; set; } = new();
}
