namespace PropertyTrackerWebAPI.Models
{
    public class Property
    {
        public Property()
        {
            Tenants = new List<Tenant>(); // Initialize as List<Tenant>
        }

        public int Id { get; set; }
        public string? Name { get; set; }
        public required string Address { get; set; }
        public int PurchasePrice { get; set; }
        public DateTime PurchaseDate { get; set; }
        public int SquareMeters { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public ICollection<Tenant> Tenants { get; set; } // Changed to ICollection
    }
}
