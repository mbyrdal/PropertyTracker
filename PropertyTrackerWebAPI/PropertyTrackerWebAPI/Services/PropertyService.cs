using PropertyTrackerWebAPI.DTOs;
using PropertyTrackerWebAPI.Models;
using PropertyTrackerWebAPI.Repositories;

namespace PropertyTrackerWebAPI.Services
{
    public class PropertyService : IPropertyService
    {
        private readonly IPropertyRepository _propertyRepository;
        private readonly ILogger<PropertyService> _logger;
        private readonly GeocodingService _geocodingService;

        public PropertyService(IPropertyRepository propertyRepository, ILogger<PropertyService> logger, GeocodingService geocodingService)
        {
            _propertyRepository = propertyRepository;
            _logger = logger;
            _geocodingService = geocodingService;
        }

        public async Task<IEnumerable<PropertyDto>> GetAllPropertiesAsync()
        {
            try
            {
                var properties = await _propertyRepository.GetAllAsync();

                if (properties == null)
                {
                    _logger.LogWarning("Repository returned null properties collection");
                    return Enumerable.Empty<PropertyDto>();
                }

                return properties.Select(p => new PropertyDto
                {
                    Id = p.Id,
                    Name = p.Name ?? "Unnamed Property",
                    Address = p.Address ?? string.Empty,
                    PurchasePrice = p.PurchasePrice,
                    PurchaseDate = p.PurchaseDate,
                    SquareMeters = p.SquareMeters,
                    Latitude = p.Latitude,
                    Longitude = p.Longitude,
                    TenantCount = p.Tenants?.Count ?? 0,
                    TotalMonthlyRent = p.Tenants?.Sum(t => t.MonthlyRent) ?? 0
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database operation failed. Error: {Error}", ex.Message);
                throw new ApplicationException("Property retrieval failed", ex);
            }
        }

        public async Task<PropertyDetailDto?> GetPropertyByIdAsync(int id)
        {
            try
            {
                var property = await _propertyRepository.GetByIdAsync(id);
                if (property == null) return null;

                return new PropertyDetailDto
                {
                    Id = property.Id,
                    Name = property.Name,
                    Address = property.Address,
                    PurchasePrice = property.PurchasePrice,
                    PurchaseDate = property.PurchaseDate,
                    Latitude = property.Latitude,
                    Longitude = property.Longitude,
                    Tenants = property.Tenants.Select(t => new TenantDto
                    {
                        Id = t.Id,
                        FirstName = t.FirstName,
                        LastName = t.LastName,
                        MonthlyRent = t.MonthlyRent,
                        MoveInDate = t.MoveInDate,
                        MoveOutDate = t.MoveInDate.AddDays(365), // Example logic for move-out date, adjust as needed
                        PropertyId = t.PropertyId,
                        PropertyName = property.Name, // Include property name for convenience
                        Payments = t.Payments.Select(p => new PaymentDto
                        {
                            Id = p.Id,
                            Amount = p.Amount,
                            PaymentDate = p.PaymentDate,
                        }).ToList()
                    }).ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving property {id}");
                throw;
            }
        }

        public async Task<PropertyDto> CreatePropertyAsync(PropertyCreateDto propertyDto)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(propertyDto.Address))
                    throw new ArgumentException("Address is required");

                // Format address and geocode
                var formattedAddress = FormatAddress(propertyDto.Address);
                var coordinates = await _geocodingService.GetCoordinatesAsync(formattedAddress);

                var property = new Property
                {
                    Name = propertyDto.Name,
                    Address = FormatAddress(propertyDto.Address),
                    PurchasePrice = propertyDto.PurchasePrice,
                    PurchaseDate = propertyDto.PurchaseDate,
                    SquareMeters = propertyDto.SquareMeters,
                    Latitude = coordinates?.Lat,
                    Longitude = coordinates?.Lng,
                    Tenants = new List<Tenant>() // Initialize empty collection
                };

                // Save to database
                var createdProperty = await _propertyRepository.AddAsync(property);

                // Return DTO
                return new PropertyDto
                {
                    Id = createdProperty.Id,
                    Name = createdProperty.Name,
                    Address = createdProperty.Address,
                    PurchasePrice = createdProperty.PurchasePrice,
                    PurchaseDate = createdProperty.PurchaseDate,
                    SquareMeters = createdProperty.SquareMeters,
                    Latitude = createdProperty.Latitude,
                    Longitude = createdProperty.Longitude,
                    TenantCount = 0,
                    TotalMonthlyRent = 0 // Initially no tenants, so rent is 0

                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating property");
                throw;
            }
        }

        public async Task UpdatePropertyAsync(int id, PropertyUpdateDto propertyDto)
        {
            try
            {
                var property = await _propertyRepository.GetByIdAsync(id);
                if (property == null)
                    throw new KeyNotFoundException($"Property {id} not found");

                if (string.IsNullOrWhiteSpace(propertyDto.Address))
                    throw new ArgumentException("Address is required");

                property.Name = propertyDto.Name;
                property.Address = FormatAddress(propertyDto.Address);
                property.PurchasePrice = propertyDto.PurchasePrice;
                property.PurchaseDate = propertyDto.PurchaseDate;
                property.SquareMeters = propertyDto.SquareMeters;

                await _propertyRepository.UpdateAsync(property);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating property {id}");
                throw;
            }
        }

        public async Task DeletePropertyAsync(int id)
        {
            try
            {
                var property = await _propertyRepository.GetByIdAsync(id);
                if (property == null)
                    throw new KeyNotFoundException($"Property {id} not found");

                // Business rule: Can't delete if property has tenants
                if (property.Tenants?.Any() == true)
                    throw new InvalidOperationException("Cannot delete property with active tenants");

                await _propertyRepository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting property {id}");
                throw;
            }
        }

        public async Task<bool> PropertyExistsAsync(int id)
        {
            try
            {
                return await _propertyRepository.ExistsAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking existence for property {id}");
                throw;
            }
        }

        private string FormatAddress(string address)
        {
            return address.Trim().ToUpperInvariant();
        }
    }
}
