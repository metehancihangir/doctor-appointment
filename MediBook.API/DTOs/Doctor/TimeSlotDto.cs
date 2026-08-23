using System;

namespace MediBook.API.DTOs.Doctor;

public class TimeSlotDto
{
    public TimeSpan Time { get; set; }
    public bool IsAvailable { get; set; }
}
