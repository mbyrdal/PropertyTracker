using System.ComponentModel.DataAnnotations;

namespace PropertyTrackerWebAPI.Models
{
    public class Expense
    {
        public int Id { get; set; }
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime DateIncurred { get; set; }
        public int PropertyId { get; set; } // Foreign key to Property
        public required Property Property { get; set; } // Navigation property to Property
        public int TenantId { get; set; } // Foreign key to Tenant
        public required Tenant Tenant { get; set; } // Navigation property to Tenant
        public int PaymentId { get; set; } // Foreign key to Payment
        public required Payment Payment { get; set; } // Navigation property to Payment
    }
}
