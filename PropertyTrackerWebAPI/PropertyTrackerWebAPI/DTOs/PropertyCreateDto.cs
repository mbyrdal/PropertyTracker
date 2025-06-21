using System.ComponentModel.DataAnnotations;

namespace PropertyTrackerWebAPI.DTOs
{
    public class PropertyCreateDto
    {
        public string? Name { get; set; }
        [Required]
        public string Address { get; set; } = string.Empty;
        [Range(1, int.MaxValue)]
        public int PurchasePrice { get; set; }
        public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;
        [Range(1, int.MaxValue)]
        public int SquareMeters { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public List<TenantCreateDto>? Tenants { get; set; } = new();
    }
}