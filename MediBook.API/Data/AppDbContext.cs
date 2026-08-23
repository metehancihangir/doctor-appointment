using Microsoft.EntityFrameworkCore;
using MediBook.API.Models;

namespace MediBook.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Users tablosu yapılandırması
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);

            entity.Property(u => u.FirstName)
                  .IsRequired()
                  .HasMaxLength(100);

            entity.Property(u => u.LastName)
                  .IsRequired()
                  .HasMaxLength(100);

            entity.Property(u => u.Email)
                  .IsRequired()
                  .HasMaxLength(255);

            // Email benzersizliği (unique index)
            entity.HasIndex(u => u.Email)
                  .IsUnique();

            entity.Property(u => u.PasswordHash)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(u => u.PhoneNumber)
                  .HasMaxLength(20);

            entity.Property(u => u.Role)
                  .HasConversion<string>() // DB'de string olarak sakla
                  .IsRequired();

            entity.Property(u => u.IsActive)
                  .HasDefaultValue(true);

            // CreatedAt: uygulama tarafında atanır (DateTime.UtcNow)
            // MySQL strict mode ile uyum için SQL default kullanılmıyor
        });
    }
}
