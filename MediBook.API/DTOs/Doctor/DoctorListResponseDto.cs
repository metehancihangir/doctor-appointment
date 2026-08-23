using System.Collections.Generic;

namespace MediBook.API.DTOs.Doctor;

public class DoctorListResponseDto
{
    public List<DoctorListItemDto> Doctors { get; set; } = new List<DoctorListItemDto>();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
