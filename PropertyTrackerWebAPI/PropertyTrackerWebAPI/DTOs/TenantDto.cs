namespace PropertyTrackerWebAPI.DTOs
{
    public class TenantDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime MoveInDate { get; set; }
        public DateTime? MoveOutDate { get; set; } // Nullable for tenants who haven't moved out yet
        public decimal MonthlyRent { get; set; } // Added
        public int PropertyId { get; set; }
        public string PropertyName { get; set; } = string.Empty; // Added for convenience
        public List<PaymentDto> Payments { get; set; } = new();
    }
}