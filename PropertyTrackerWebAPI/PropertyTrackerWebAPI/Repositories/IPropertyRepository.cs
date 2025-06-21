using PropertyTrackerWebAPI.Models;

namespace PropertyTrackerWebAPI.Repositories
{
    public interface IPropertyRepository
    {
        Task<IEnumerable<Property>> GetAllAsync();
        Task<Property?> GetByIdAsync(int id);
        Task<Property> AddSync(Property property);
        Task UpdateAsync(Property property);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}
