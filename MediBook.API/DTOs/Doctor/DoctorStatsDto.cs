namespace MediBook.API.DTOs.Doctor;

public class DoctorStatsDto
{
    public int TodayCount { get; set; }
    public int PendingCount { get; set; }
    public int CompletedCount { get; set; }
    public int TotalCount { get; set; }
}
