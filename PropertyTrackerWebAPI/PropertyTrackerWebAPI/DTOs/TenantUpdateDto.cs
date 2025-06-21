using System.ComponentModel.DataAnnotations;

namespace PropertyTrackerWebAPI.DTOs
{
    public class TenantUpdateDto
    {
        [StringLength(50)]
        public string? FirstName { get; set; }

        [StringLength(50)]
        public string? LastName { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Monthly rent must be positive")]
        public decimal MonthlyRent { get; set; }  // Add this line

        [DataType(DataType.Date)]
        public DateTime? MoveOutDate { get; set; }
    }
}
