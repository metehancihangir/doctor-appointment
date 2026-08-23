namespace MediBook.API.DTOs.Doctor;

public class DoctorListItemDto
{
    public int DoctorId { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; }
    public string Specialty { get; set; }
    public int YearsOfExperience { get; set; }
}
