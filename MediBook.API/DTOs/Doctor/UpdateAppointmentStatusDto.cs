using MediBook.API.Models;

namespace MediBook.API.DTOs.Doctor;

public class UpdateAppointmentStatusDto
{
    public AppointmentStatus Status { get; set; }
}
