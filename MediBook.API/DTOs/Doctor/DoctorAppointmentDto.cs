using System;

namespace MediBook.API.DTOs.Doctor;

public class DoctorAppointmentDto
{
    public int Id { get; set; }
    public string PatientFullName { get; set; }
    public string PatientPhone { get; set; }
    public int PatientAge { get; set; }
    public DateTime AppointmentDate { get; set; }
    public TimeSpan AppointmentTime { get; set; }
    public string Status { get; set; }
    public string? Symptoms { get; set; }
    public string? PatientNotes { get; set; }
    public string? DoctorNotes { get; set; }
    public string? Diagnosis { get; set; }
}
