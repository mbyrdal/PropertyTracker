namespace PropertyTrackerWebAPI.Models
{
    public class Property
    {
        public Property()
        {
            Tenants = new List<Tenant>();
        }

        public int Id { get; set; }
        public string? Name { get; set; }
        public required string Address { get; set; }
        public int PurchasePrice { get; set; } // in DKK
        public DateTime PurchaseDate { get; set; } // UTC
        public int SquareMeters { get; set; } // Size in square meters
        public double? Latitude { get; set; } // Nullable for cases where geocoding fails
        public double? Longitude { get; set; }
        public required ICollection<Tenant> Tenants { get; set; }
    }
}
