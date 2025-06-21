using Microsoft.EntityFrameworkCore;
using PropertyTrackerWebAPI.Models;

namespace PropertyTrackerWebAPI.EFDataContext
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        public DbSet<Property> Properties { get; set; }
        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<Payment> Payments { get; set; }

        // Optional: Add model configurations
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure relationships/constraints here if needed
            modelBuilder.Entity<Tenant>(entity =>
            {
                entity.Property(e => e.MonthlyRent).HasColumnType("decimal(18,2)"); // explicitly map the column
            });
        }
    }
}
