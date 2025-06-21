using PropertyTrackerWebAPI.EFDataContext;
using PropertyTrackerWebAPI.Models;
using Microsoft.EntityFrameworkCore;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (context == null) throw new ArgumentNullException(nameof(context));
        // Ensure the database is created
        await context.Database.EnsureCreatedAsync();
        // Seed properties with tenants
        await SeedPropertiesWithTenantsAsync(context);
    }
    /// <summary>
    /// Seeds the database with initial properties and tenants.
    /// </summary>
    /// <param name="context">The application database context.</param>

    private static async Task SeedPropertiesWithTenantsAsync(ApplicationDbContext context)
    {
        if (await context.Properties.AnyAsync()) return;

        var properties = new List<Property>
    {
        new Property() // Explicitly specify type
        {
            Name = "Frederiksberg Lejlighed",
            Address = "Gammel Kongevej 123, 1850 Frederiksberg C",
            Latitude = 55.6794,
            Longitude = 12.5346,
            PurchasePrice = 3500000,
            PurchaseDate = DateTime.UtcNow.AddYears(-2),
            SquareMeters = 85,
            Tenants = new List<Tenant>() // Initialize as List<Tenant>
        }
    };

        await context.Properties.AddRangeAsync(properties);
        await context.SaveChangesAsync();

        var tenants = new List<Tenant>
    {
        new Tenant() // Explicitly specify type
        {
            FirstName = "Anders",
            LastName = "Jensen",
            MoveInDate = DateTime.UtcNow.AddMonths(-12),
            MonthlyRent = 12500,
            PropertyId = properties[0].Id,
            Property = properties[0],
            Payments = new List<Payment>() // Initialize as List<Payment>
        }
    };

        // This will now work because Tenants is ICollection<Tenant>
        properties[0].Tenants.Add(tenants[0]);

        await context.Tenants.AddRangeAsync(tenants);
        await context.SaveChangesAsync();

        var payments = new List<Payment>
    {
        new Payment() // Explicitly specify type
        {
            Amount = 12500,
            PaymentDate = DateTime.UtcNow.AddMonths(-1),
            TenantId = tenants[0].Id,
            Tenant = tenants[0]
        }
    };

        tenants[0].Payments.Add(payments[0]);
        await context.Payments.AddRangeAsync(payments);
        await context.SaveChangesAsync();
    }
}