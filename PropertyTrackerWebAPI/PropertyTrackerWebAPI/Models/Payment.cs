namespace PropertyTrackerWebAPI.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public int TenantId { get; set; }
        public required Tenant Tenant { get; set; }
    }
}
