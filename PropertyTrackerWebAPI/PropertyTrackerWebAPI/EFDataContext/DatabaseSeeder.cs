using PropertyTrackerWebAPI.Models;

namespace PropertyTrackerWebAPI.EFDataContext
{
    /// <summary>
    /// DatabaseSeeder is responsible for seeding the database with initial data.
    /// </summary>
    public class DatabaseSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            if (!context.Properties.Any())
            {
                var properties = new List<Property>
                {
                    new Property { Name = "Property 1", Address = "123 Main St" },
                    new Property { Name = "Property 2", Address = "456 Elm St" }
                };

                await context.Properties.AddRangeAsync(properties);
                await context.SaveChangesAsync();

                var tenants = new List<Tenant>
                {
                    new Tenant { FirstName = "John", LastName = "Doe", MoveInDate = DateTime.UtcNow, PropertyId = properties[0].Id },
                    new Tenant { FirstName = "Jane", LastName = "Smith", MoveInDate = DateTime.UtcNow, PropertyId = properties[1].Id }
                };

                await context.Tenants.AddRangeAsync(tenants);
                await context.SaveChangesAsync();
            }
        }
    }
}
