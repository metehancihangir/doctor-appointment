using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MediBook.API.Models
{
    public class PatientProfile
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public DateTime DateOfBirth { get; set; }

        [MaxLength(10)]
        public string? Gender { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        // Navigation property
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}
