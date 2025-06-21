using System.ComponentModel.DataAnnotations;

namespace PropertyTrackerWebAPI.DTOs
{
    public class TenantCreateDto
    {
        [Required]
        [StringLength(50)]
        public string FirstName { get; set; }

        [Required]
        [StringLength(50)]
        public string LastName { get; set; }

        [DataType(DataType.Date)]
        public DateTime MoveInDate { get; set; } = DateTime.UtcNow;

        [Required]
        [Range(1, int.MaxValue)]
        public int PropertyId { get; set; }
    }
}
