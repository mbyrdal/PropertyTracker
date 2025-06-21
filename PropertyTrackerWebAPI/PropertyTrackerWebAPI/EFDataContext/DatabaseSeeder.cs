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
        // Check if database is already seeded and skip seeding if so
        // We disable this during development to allow re-seeding; re-enable it in production
        // if (await context.Properties.AnyAsync()) return;

        // Clear existing data
        context.Payments.RemoveRange(context.Payments);
        context.Tenants.RemoveRange(context.Tenants);
        context.Properties.RemoveRange(context.Properties);

        // Reset sequences for PostgreSQL
        await context.Database.ExecuteSqlRawAsync("ALTER SEQUENCE \"Properties_Id_seq\" RESTART WITH 1");
        await context.Database.ExecuteSqlRawAsync("ALTER SEQUENCE \"Tenants_Id_seq\" RESTART WITH 1");
        await context.Database.ExecuteSqlRawAsync("ALTER SEQUENCE \"Payments_Id_seq\" RESTART WITH 1");

        await context.SaveChangesAsync();

        // ----- Properties -----
        var properties = new List<Property>
        {
            // 1. Frederiksberg Lejlighed
            new Property
            {
                Name = "Frederiksberg Lejlighed",
                Address = "Gammel Kongevej 123, 1850 Frederiksberg C",
                Latitude = 55.6794,
                Longitude = 12.5346,
                PurchasePrice = 3500000,
                PurchaseDate = DateTime.UtcNow.AddYears(-2),
                SquareMeters = 85,
                Tenants = new List<Tenant>()
            },

            // 2. Aarhus rækkehus
            new Property
            {
                Name = "Århus Rækkehus",
                Address = "Marselisborg Allé 45, 8000 Aarhus C",
                Latitude = 56.1440,
                Longitude = 10.2039,
                PurchasePrice = 4500000,
                PurchaseDate = DateTime.UtcNow.AddYears(-3),
                SquareMeters = 120,
                Tenants = new List<Tenant>()
            },

            // 3. Odense villa
            new Property
            {
                Name = "Odense Villa",
                Address = "Hunderupvej 17, 5230 Odense M",
                Latitude = 55.3830,
                Longitude = 10.3860,
                PurchasePrice = 5200000,
                PurchaseDate = DateTime.UtcNow.AddYears(-4),
                SquareMeters = 150,
                Tenants = new List<Tenant>()
            },

            // 4. Aalborg penthouse
            new Property
            {
                Name = "Aalborg Penthouse",
                Address = "Boulevarden 8, 9000 Aalborg",
                Latitude = 57.0488,
                Longitude = 9.9217,
                PurchasePrice = 6100000,
                PurchaseDate = DateTime.UtcNow.AddYears(-1),
                SquareMeters = 110,
                Tenants = new List<Tenant>()
            }
        };

        await context.Properties.AddRangeAsync(properties);
        await context.SaveChangesAsync();

        // ----- Tenants -----
        var tenants = new List<Tenant>
        {
            // Lejer til Frederiksberg lejlighed
            new Tenant
            {
                FirstName = "Anders",
                LastName = "Jensen",
                MoveInDate = DateTime.UtcNow.AddMonths(-12),
                MonthlyRent = 12500,
                PropertyId = properties[0].Id,
                Property = properties[0],
                Payments = new List<Payment>() // Initialize as List<Payment>
            },

            // Lejer til Aarhus rækkehus
            new Tenant
            {
                FirstName = "Mette",
                LastName = "Hansen",
                MoveInDate = DateTime.UtcNow.AddMonths(-12),
                MonthlyRent = 12500,
                PropertyId = properties[1].Id,
                Property = properties[1],
            },

            // Lejer til Odense villa
            new Tenant
            {
                FirstName = "Lars",
                LastName = "Bach Sørensen",
                MoveInDate = DateTime.UtcNow.AddMonths(-18),
                MonthlyRent = 14500,
                PropertyId = properties[2].Id,
                Property = properties[2],
                Payments = new List<Payment>()
            },

            // Lejer til Aalborg penthouse
            new Tenant
            {
                FirstName = "Emilie",
                LastName = "Pedersen",
                MoveInDate = DateTime.UtcNow.AddMonths(-3),
                MonthlyRent = 18500,
                PropertyId = properties[3].Id,
                Property = properties[3],
                Payments = new List<Payment>()
            }
        };

        // This will now work because Tenants is ICollection<Tenant>
        for (var i = 0; i < tenants.Count; i++)
        {
            var propertyIndex = tenants[i].PropertyId == properties[0].Id ? 0 :
                                tenants[i].PropertyId == properties[1].Id ? 1 :
                                tenants[i].PropertyId == properties[2].Id ? 2 : 3;
            properties[propertyIndex].Tenants.Add(tenants[i]);
        }

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