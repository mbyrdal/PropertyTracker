namespace PropertyTrackerWebAPI.Models
{
    public class Tenant
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime MoveInDate { get; set; }
        public int PropertyId { get; set; }
        public Property Property { get; set; }
        public ICollection<Payment> Payments { get; set; }
    }
}
