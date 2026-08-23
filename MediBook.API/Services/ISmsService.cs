using System.Threading.Tasks;

namespace MediBook.API.Services;

public interface ISmsService
{
    Task SendAsync(string toNumber, string message, int userId, int? appointmentId = null);
}
