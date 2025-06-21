namespace PropertyTrackerWebAPI.Models
{
    public class Tenant
    {
        public int Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public DateTime MoveInDate { get; set; }
        public int PropertyId { get; set; }
        public Property? Property { get; set; }
        public required ICollection<Payment> Payments { get; set; }
    }
}
