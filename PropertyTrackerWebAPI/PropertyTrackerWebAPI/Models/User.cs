using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PropertyTrackerWebAPI.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        [Column("Id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [Column("Email")]
        [MaxLength(255)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Column("Username")]
        [MaxLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [Column("PasswordHash")]
        public string PasswordHash { get; set; } = string.Empty; // Store hashed password

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("Role")]
        [MaxLength(30)]
        public string Role { get; set; } = "User"; // Default role is User
    }
}
