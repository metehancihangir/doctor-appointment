using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace MediBook.API.Data;

/// <summary>
/// EF Core migration'larının design-time'da AppDbContext oluşturabilmesi için factory.
/// appsettings.json'ı olmadan da migration çalışabilir.
/// </summary>
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

        // Design-time için connection string doğrudan burada
        optionsBuilder.UseMySql(
            "Server=localhost;Port=3306;Database=medibook_db;User=root;Password=devide123;",
            ServerVersion.AutoDetect("Server=localhost;Port=3306;Database=medibook_db;User=root;Password=devide123;")
        );

        return new AppDbContext(optionsBuilder.Options);
    }
}
