using System;

namespace MediBook.API.DTOs.Doctor;

public class AvailableSlotsRequestDto
{
    public int DoctorId { get; set; }
    public DateTime Date { get; set; }
}
