namespace PropertyTrackerWebAPI.DTOs
{
    public class PropertyDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string Address { get; set; } = string.Empty; // Required in entity
        public int PurchasePrice { get; set; } // New field
        public DateTime PurchaseDate { get; set; } // New field
        public int SquareMeters { get; set; } // New field
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public int TenantCount { get; set; } // Calculated
        public decimal TotalMonthlyRent { get; set; } // Calculated from tenants
    }
}