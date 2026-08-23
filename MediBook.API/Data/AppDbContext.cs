using Microsoft.EntityFrameworkCore;
using MediBook.API.Models;

namespace MediBook.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<PatientProfile> PatientProfiles => Set<PatientProfile>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<DoctorProfile> DoctorProfiles => Set<DoctorProfile>();
    public DbSet<DoctorAvailability> DoctorAvailabilities => Set<DoctorAvailability>();
    public DbSet<Appointment> Appointments => Set<Appointment>();

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
        // DoctorProfile tablosu yapılandırması
        modelBuilder.Entity<DoctorProfile>(entity =>
        {
            entity.HasKey(d => d.Id);

            entity.HasIndex(d => d.UserId)
                  .IsUnique();

            entity.HasOne(d => d.User)
                  .WithOne()
                  .HasForeignKey<DoctorProfile>(d => d.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(d => d.Specialty).IsRequired().HasMaxLength(100);
        });

        // DoctorAvailability tablosu yapılandırması
        modelBuilder.Entity<DoctorAvailability>(entity =>
        {
            entity.HasKey(da => da.Id);

            entity.HasOne(da => da.Doctor)
                  .WithMany(d => d.Availabilities)
                  .HasForeignKey(da => da.DoctorId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Appointment tablosu yapılandırması
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(a => a.Id);

            entity.HasOne(a => a.Patient)
                  .WithMany()
                  .HasForeignKey(a => a.PatientId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(a => a.Doctor)
                  .WithMany()
                  .HasForeignKey(a => a.DoctorId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.Property(a => a.Status)
                  .HasConversion<string>()
                  .IsRequired();
        });

        // Seed Data
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@medibook.com",
                PasswordHash = "$2a$11$u.qPMhhQIaPyXHlzLKp/RO6M1AS1i2sxA8Oh9FH5SpdDD7N9HCU4W",
                Role = UserRole.Admin,
                IsActive = true
            },
            new User
            {
                Id = 2,
                FirstName = "Ali",
                LastName = "Veli",
                Email = "doctor@medibook.com",
                PasswordHash = "$2a$11$8TsgEZsdUleMGfoZUHwh3u54lSwKl.eHdapmkgb5Flu.U2svkIm72",
                Role = UserRole.Doctor,
                IsActive = true
            }
        );

        modelBuilder.Entity<DoctorProfile>().HasData(
            new DoctorProfile
            {
                Id = 1,
                UserId = 2, // Ali Veli
                Specialty = "Pediatri",
                Bio = "Çocuk hastalıkları uzmanı.",
                YearsOfExperience = 5
            }
        );

        modelBuilder.Entity<DoctorAvailability>().HasData(
            new DoctorAvailability { Id = 1, DoctorId = 1, DayOfWeek = DayOfWeek.Monday, StartTime = new TimeSpan(9, 0, 0), EndTime = new TimeSpan(17, 0, 0) },
            new DoctorAvailability { Id = 2, DoctorId = 1, DayOfWeek = DayOfWeek.Tuesday, StartTime = new TimeSpan(9, 0, 0), EndTime = new TimeSpan(17, 0, 0) },
            new DoctorAvailability { Id = 3, DoctorId = 1, DayOfWeek = DayOfWeek.Wednesday, StartTime = new TimeSpan(9, 0, 0), EndTime = new TimeSpan(17, 0, 0) },
            new DoctorAvailability { Id = 4, DoctorId = 1, DayOfWeek = DayOfWeek.Thursday, StartTime = new TimeSpan(9, 0, 0), EndTime = new TimeSpan(17, 0, 0) },
            new DoctorAvailability { Id = 5, DoctorId = 1, DayOfWeek = DayOfWeek.Friday, StartTime = new TimeSpan(9, 0, 0), EndTime = new TimeSpan(17, 0, 0) }
        );
    }
}
