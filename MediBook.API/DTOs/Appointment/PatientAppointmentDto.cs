using System;

namespace MediBook.API.DTOs.Appointment;

public class PatientAppointmentDto
{
    public int Id { get; set; }
    public string DoctorFullName { get; set; }
    public string DoctorSpecialty { get; set; }
    public DateTime AppointmentDate { get; set; }
    public TimeSpan AppointmentTime { get; set; }
    public string Status { get; set; }
    public string? Symptoms { get; set; }
    public DateTime CreatedAt { get; set; }
}
