using Microsoft.EntityFrameworkCore;
using PropertyTrackerWebAPI.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PropertyTrackerWebAPI.EFDataContext
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            await SeedPropertiesWithTenantsAsync(context);
        }

        private static async Task SeedPropertiesWithTenantsAsync(ApplicationDbContext context)
        {
            if (await context.Properties.AnyAsync())
            {
                return; // Database already seeded
            }

            // Create properties with Danish locations
            var properties = new List<Property>
            {
                new()
                {
                    Name = "Frederiksberg Lejlighed",
                    Address = "Gammel Kongevej 123, 1850 Frederiksberg C",
                    Latitude = 55.6794,  // Frederiksberg coordinates
                    Longitude = 12.5346,
                    PurchasePrice = 3500000, // in DKK
                    PurchaseDate = DateTime.UtcNow.AddYears(-2),
                    SquareMeters = 85,
                    Tenants = new List<Tenant>()
                },
                new()
                {
                    Name = "Nørrebro Ejendom",
                    Address = "Nørrebrogade 456, 2200 København N",
                    Latitude = 55.6944,  // Nørrebro coordinates
                    Longitude = 12.5421,
                    PurchasePrice = 2800000, // in DKK
                    PurchaseDate = DateTime.UtcNow.AddYears(-1),
                    SquareMeters = 65,
                    Tenants = new List<Tenant>()
                },
                new()
                {
                    Name = "Østerbro Villa",
                    Address = "Strandboulevarden 789, 2100 København Ø",
                    Latitude = 55.7065,  // Østerbro coordinates
                    Longitude = 12.5833,
                    PurchasePrice = 6500000, // in DKK
                    PurchaseDate = DateTime.UtcNow.AddMonths(-6),
                    SquareMeters = 120,
                    Tenants = new List<Tenant>()
                }
            };

            // Create Danish tenants
            var tenants = new List<Tenant>
            {
                new()
                {
                    FirstName = "Anders",
                    LastName = "Jensen",
                    MoveInDate = DateTime.UtcNow.AddMonths(-12),
                    MonthlyRent = 12500, // in DKK
                    PropertyId = 1,
                    Property = properties[0],
                    Payments = new List<Payment>()
                },
                new()
                {
                    FirstName = "Mette",
                    LastName = "Nielsen",
                    MoveInDate = DateTime.UtcNow.AddMonths(-6),
                    MonthlyRent = 9500, // in DKK
                    PropertyId = 2,
                    Property = properties[1],
                    Payments = new List<Payment>()
                },
                new()
                {
                    FirstName = "Peter",
                    LastName = "Hansen",
                    MoveInDate = DateTime.UtcNow.AddMonths(-3),
                    MonthlyRent = 18000, // in DKK
                    PropertyId = 3,
                    Property = properties[2],
                    Payments = new List<Payment>()
                }
            };

            // Add some payment history
            var payments = new List<Payment>
            {
                new()
                {
                    Amount = 12500,
                    PaymentDate = DateTime.UtcNow.AddMonths(-1),
                    Tenant = tenants[0],
                    TenantId = 1
                },
                new()
                {
                    Amount = 12500,
                    PaymentDate = DateTime.UtcNow.AddMonths(-2),
                    Tenant = tenants[0],
                    TenantId = 1
                },
                new()
                {
                    Amount = 9500,
                    PaymentDate = DateTime.UtcNow.AddMonths(-1),
                    Tenant = tenants[1],
                    TenantId = 2
                }
            };

            await context.Properties.AddRangeAsync(properties);
            await context.Tenants.AddRangeAsync(tenants);
            await context.Payments.AddRangeAsync(payments);
            await context.SaveChangesAsync();
        }
    }
}