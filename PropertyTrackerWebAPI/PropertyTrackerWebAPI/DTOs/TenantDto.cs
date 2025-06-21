using System.ComponentModel.DataAnnotations;

namespace PropertyTrackerWebAPI.DTOs
{
    public class TenantDto
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public required string FirstName { get; set; }

        [Required]
        [StringLength(50)]
        public required string LastName { get; set; }
        public decimal MonthlyRent { get; set; } // in DKK

        [DataType(DataType.Date)]
        public DateTime MoveInDate { get; set; }

        [DataType(DataType.Date)]
        public DateTime? MoveOutDate { get; set; }
        public IEnumerable<PaymentDto> Payments { get; set; } = new List<PaymentDto>();
        public int PropertyId { get; set; }
        public string? PropertyName { get; set; } // Added for convenience
    }
}
