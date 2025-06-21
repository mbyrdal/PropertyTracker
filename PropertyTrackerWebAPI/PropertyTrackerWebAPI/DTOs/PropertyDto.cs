namespace PropertyTrackerWebAPI.DTOs
{
    public class PropertyDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string Address { get; set; } = string.Empty;
        public int TenantCount { get; set; } // Derived from Tenants collection
    }
}
