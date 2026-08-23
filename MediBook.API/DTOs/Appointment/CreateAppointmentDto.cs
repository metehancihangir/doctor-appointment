using System;

namespace MediBook.API.DTOs.Appointment;

public class CreateAppointmentDto
{
    public int DoctorId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public TimeSpan AppointmentTime { get; set; }
    public string? Symptoms { get; set; }
    public string? PatientNotes { get; set; }
}
