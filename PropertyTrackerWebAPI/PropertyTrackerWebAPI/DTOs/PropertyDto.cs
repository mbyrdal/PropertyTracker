namespace PropertyTrackerWebAPI.DTOs
{
    public class PropertyDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string Address { get; set; } = string.Empty;
        public int PurchasePrice { get; set; }
        public DateTime PurchaseDate { get; set; }
        public int SquareMeters { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public int TenantCount { get; set; }
        public decimal TotalMonthlyRent { get; set; }
    }
}