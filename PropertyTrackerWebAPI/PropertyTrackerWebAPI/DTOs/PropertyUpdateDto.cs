using System.ComponentModel.DataAnnotations;

namespace PropertyTrackerWebAPI.DTOs
{
    public class PropertyUpdateDto
    {
        public string? Name { get; set; }

        [Required]
        [StringLength(200)]
        public string? Address { get; set; } = string.Empty;
    }
}
