using System.ComponentModel.DataAnnotations;

namespace PropertyTrackerWebAPI.DTOs
{
    public class RegisterRequest
    {
        [Required, EmailAddress, MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(3), MaxLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required, MinLength(8)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$")] // Complexity rules: 
        public string Password { get; set; } = string.Empty;
    }
}
