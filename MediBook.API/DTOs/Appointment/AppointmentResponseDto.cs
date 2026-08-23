using System;

namespace MediBook.API.DTOs.Appointment;

public class AppointmentResponseDto
{
    public int Id { get; set; }
    public string DoctorName { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan Time { get; set; }
    public string Status { get; set; }
}
