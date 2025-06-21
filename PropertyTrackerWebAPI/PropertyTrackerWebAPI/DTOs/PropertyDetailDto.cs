namespace PropertyTrackerWebAPI.DTOs
{
    public class PropertyDetailDto : PropertyDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string Address { get; set; } = string.Empty;
        public IEnumerable<TenantDto> Tenants { get; set; } = new List<TenantDto>();
    }
}
