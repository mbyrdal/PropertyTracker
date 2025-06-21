using Microsoft.EntityFrameworkCore;
using PropertyTrackerWebAPI.Models;

namespace PropertyTrackerWebAPI.EFDataContext
{
    /// <summary>
    /// DatabaseSeeder is responsible for seeding the database with initial data.
    /// </summary>
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            await SeedPropertiesWithTenantsAsync(context);

            // Add more seed methods as needed for other entities
        }

        private static async Task SeedPropertiesWithTenantsAsync(ApplicationDbContext context)
        {
            if (await context.Properties.AnyAsync())
            {
                return; // Database already seeded
            }

            // Create properties with empty tenant collections
            var properties = new List<Property>
            {
                new()
                {
                    Name = "Property 1", 
                    Address = "123 Main St, Springfield", 
                    Latitude = 39.7817, // Example coordinates for Springfield, IL
                    Longitude = -89.6501, // Example coordinates for Springfield, IL
                    Tenants = new List<Tenant>()
                },
                new()
                {
                    Name = "Property 2", 
                    Address = "456 Elm St, Springfield", 
                    Latitude = 39.7939, // Example coordinates for Springfield, IL
                    Longitude = -89.6446, // Example coordinates for Springfield, IL
                    Tenants = new List<Tenant>()
                }
            };

            // Create tenants and associate them with properties
            var tenants = new List<Tenant>
            {
                new()
                {
                    FirstName = "John", LastName = "Doe", MoveInDate = DateTime.UtcNow.AddMonths(-3), PropertyId = 1, Property = properties[0], Payments = new List<Payment>()
                },
                new()
                {
                    FirstName = "Jane", LastName = "Smith", MoveInDate = DateTime.UtcNow.AddMonths(-1), PropertyId = 1, Property = properties[1], Payments = new List<Payment>()
                },
            };

            // EF Core will handle the relationship mapping automatically
            await context.Properties.AddRangeAsync(properties);
            await context.Tenants.AddRangeAsync(tenants);
            await context.SaveChangesAsync();
        }
    }
}
