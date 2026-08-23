using System;

namespace MediBook.API.DTOs.Admin;

public class AvailabilityDto
{
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}
