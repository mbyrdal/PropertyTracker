namespace PropertyTrackerWebAPI.DTOs
{
    public class PropertyDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string Address { get; set; } = string.Empty;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public int TenantCount { get; set; } // Derived from Tenants collection
        public decimal TotalMonthlyRent { get; set; } // Total monthly rent from all tenants in DKK
    }
}
