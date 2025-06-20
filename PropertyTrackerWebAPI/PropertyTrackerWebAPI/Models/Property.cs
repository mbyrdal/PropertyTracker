namespace PropertyTrackerWebAPI.Models
{
    public class Property
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public required string Address { get; set; }
        public required ICollection<Tenant> Tenants { get; set; }
    }
}
