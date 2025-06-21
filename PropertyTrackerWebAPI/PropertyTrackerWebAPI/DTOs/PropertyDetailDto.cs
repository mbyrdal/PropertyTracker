namespace PropertyTrackerWebAPI.DTOs
{
    public class PropertyDetailDto : PropertyDto
    {
        public List<TenantDto> Tenants { get; set; } = new();
    }
}