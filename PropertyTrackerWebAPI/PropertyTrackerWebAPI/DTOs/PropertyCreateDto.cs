using System.ComponentModel.DataAnnotations;

namespace PropertyTrackerWebAPI.DTOs
{
    public class PropertyCreateDto
    {
        public string? Name { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Address { get; set; } = string.Empty;

        public decimal PurchasePrice { get; set; } // in DKK
        public DateTime PurchaseDate { get; set; } // UTC
        public int SquareMeters { get; set; } // Size in square meters
        public double? Latitude { get; set; } // Nullable for cases where geocoding fails
        public double? Longitude { get; set; }
        public IEnumerable<TenantCreateDto>? Tenants { get; set; } = new List<TenantCreateDto>();
    }
}
