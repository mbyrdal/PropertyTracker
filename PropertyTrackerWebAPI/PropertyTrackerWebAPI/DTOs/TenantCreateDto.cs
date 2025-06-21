using System.ComponentModel.DataAnnotations;

namespace PropertyTrackerWebAPI.DTOs
{
    public class TenantCreateDto
    {
        [Required]
        [StringLength(50)]
        public required string FirstName { get; set; }

        [Required]
        [StringLength(50)]
        public required string LastName { get; set; }

        [DataType(DataType.Date)]
        public DateTime MoveInDate { get; set; } = DateTime.UtcNow;

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Monthly rent must be a positive value.")]
        public decimal MonthlyRent { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int PropertyId { get; set; }
    }
}
