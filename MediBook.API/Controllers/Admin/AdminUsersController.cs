using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MediBook.API.Data;
using MediBook.API.DTOs.Admin;
using MediBook.API.Models;
using System.Linq;
using System.Threading.Tasks;

namespace MediBook.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminUsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetUsers([FromQuery] string? role, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrEmpty(role) && System.Enum.TryParse<UserRole>(role, true, out var parsedRole))
        {
            query = query.Where(u => u.Role == parsedRole);
        }

        query = query.OrderByDescending(u => u.CreatedAt);

        var totalCount = await query.CountAsync();
        
        var users = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new AdminUserListItemDto
            {
                Id = u.Id,
                FullName = $"{u.FirstName} {u.LastName}",
                Email = u.Email,
                Role = u.Role.ToString(),
                IsActive = u.IsActive
            })
            .ToListAsync();

        return Ok(new
        {
            Users = users,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] UpdateUserStatusDto request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "Kullanıcı bulunamadı." });

        // Adminin kendini pasif yapmasını engelleyebiliriz
        if (user.Role == UserRole.Admin)
            return BadRequest(new { message = "Admin hesabının durumu değiştirilemez." });

        user.IsActive = request.IsActive;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Kullanıcı durumu güncellendi.", isActive = user.IsActive });
    }
}
