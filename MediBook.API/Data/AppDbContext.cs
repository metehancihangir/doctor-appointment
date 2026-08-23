using Microsoft.EntityFrameworkCore;
using MediBook.API.Models;

namespace MediBook.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<PatientProfile> PatientProfiles => Set<PatientProfile>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

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

        // PatientProfile tablosu yapılandırması
        modelBuilder.Entity<PatientProfile>(entity =>
        {
            entity.HasKey(p => p.Id);
            
            entity.HasIndex(p => p.UserId)
                  .IsUnique(); // 1-to-1 relationship

            entity.HasOne(p => p.User)
                  .WithOne()
                  .HasForeignKey<PatientProfile>(p => p.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // RefreshToken tablosu yapılandırması
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(r => r.Id);

            entity.HasIndex(r => r.Token)
                  .IsUnique();

            entity.HasOne(r => r.User)
                  .WithMany()
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
