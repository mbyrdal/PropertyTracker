namespace PropertyTrackerWebAPI.Models
{
    public class Tenant
    {
        public Tenant()
        {
            Payments = new List<Payment>();
        }

        public int Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public DateTime MoveInDate { get; set; }
        public decimal MonthlyRent { get; set; }
        public int PropertyId { get; set; }
        public Property Property { get; set; } = null!;
        public ICollection<Payment> Payments { get; set; }
    }
}
