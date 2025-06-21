using PropertyTrackerWebAPI.DTOs;

namespace PropertyTrackerWebAPI.Services
{
    public interface IPropertyService
    {
        Task<IEnumerable<PropertyDto>> GetAllPropertiesAsync();
        Task<PropertyDetailDto?> GetPropertyByIdAsync(int id);
        Task<PropertyDto> CreatePropertyAsync(PropertyCreateDto propertyDto);
        Task UpdatePropertyAsync(int id, PropertyUpdateDto propertyDto);
        Task DeletePropertyAsync(int id);
        Task<bool> PropertyExistsAsync(int id);
    }
}
