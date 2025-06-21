using System.ComponentModel.DataAnnotations;

namespace PropertyTrackerWebAPI.DTOs
{
    public class PropertyUpdateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int PurchasePrice { get; set; }  // Added

        public DateTime PurchaseDate { get; set; }  // Added

        [Range(1, int.MaxValue)]
        public int SquareMeters { get; set; }  // Added

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}