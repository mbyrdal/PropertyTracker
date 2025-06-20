namespace PropertyTrackerWebAPI.Models
{
    public class Property
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public ICollection<Tenant> Tenants { get; set; }
    }
}
