namespace PropertyTrackerWebAPI.DTOs
{
    public class PropertyDetailDto : PropertyDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string Address { get; set; } = string.Empty;
        public int PurchasePrice { get; set; } // in DKK
        public DateTime PurchaseDate { get; set; } // UTC
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public IEnumerable<TenantDto> Tenants { get; set; } = new List<TenantDto>();
    }
}
