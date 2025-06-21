using System.ComponentModel.DataAnnotations;

namespace PropertyTrackerWebAPI.DTOs
{
    public class TenantUpdateDto
    {
        [StringLength(50)]
        public string? FirstName { get; set; }

        [StringLength(50)]
        public string? LastName { get; set; }

        [DataType(DataType.Date)]
        public DateTime? MoveOutDate { get; set; }
    }
}
