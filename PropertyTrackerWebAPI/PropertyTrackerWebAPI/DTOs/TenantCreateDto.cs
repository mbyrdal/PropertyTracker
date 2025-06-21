using System.ComponentModel.DataAnnotations;

namespace PropertyTrackerWebAPI.DTOs
{
    public class TenantCreateDto
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        public string LastName { get; set; } = string.Empty;
        public DateTime MoveInDate { get; set; } = DateTime.UtcNow;
        [Range(0.01, double.MaxValue)]
        public decimal MonthlyRent { get; set; } // Added
        [Required]
        public int PropertyId { get; set; }
    }
}
