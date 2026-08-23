using System;

namespace MediBook.API.DTOs.Admin;

public class DailyAppointmentStatDto
{
    public DateTime Date { get; set; }
    public int Total { get; set; }
    public int Completed { get; set; }
    public int Cancelled { get; set; }
}
