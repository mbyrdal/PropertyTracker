using Microsoft.EntityFrameworkCore;
using PropertyTrackerWebAPI.EFDataContext;
using PropertyTrackerWebAPI.Models;

namespace PropertyTrackerWebAPI.Repositories
{
    public class PropertyRepository : IPropertyRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PropertyRepository> _logger;

        public PropertyRepository(ApplicationDbContext context, ILogger<PropertyRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Retrieves all properties from the database, including their associated tenants.
        /// </summary>
        /// <returns></returns>
        public async Task<IEnumerable <Property>> GetAllAsync()
        {
            try
            {
                return await _context.Properties
                .Include(p => p.Tenants)
                .ToListAsync();
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving all properties.");
                throw; // Re-throw for service layer to handle
            }
        }

        /// <summary>
        /// Retrieves a property by its ID, including its associated tenants.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<Property?> GetByIdAsync(int id)
        {
            try
            {
                return await _context.Properties.Include(p => p.Tenants)
                .FirstOrDefaultAsync(p => p.Id == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occurred while retrieving property with ID {id}.");
                throw; // Re-throw for service layer to handle
            }
        }

        public async Task<Property> AddAsync(Property property)
        {
            try
            {
                await _context.Properties.AddAsync(property);
                await _context.SaveChangesAsync();
                return property; // Return the added property
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "An error occurred while adding a new property.");
                throw; // Re-throw for service layer to handle
            }
        }

        /// <summary>
        /// Updates an existing property in the database.
        /// </summary>
        /// <param name="property"></param>
        /// <returns></returns>
        /// <exception cref="KeyNotFoundException"></exception>
        public async Task UpdateAsync(Property property)
        {
            try
            {
                var doesPropertyExist = await _context.Properties.FirstOrDefaultAsync(p => p.Id == property.Id);

                if(doesPropertyExist == null)
                {
                    throw new KeyNotFoundException($"Property with ID {property.Id} not found.");
                }

                _context.Entry(doesPropertyExist).CurrentValues.SetValues(property);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occurred while updating property with ID {property.Id}.");
                throw; // Re-throw for service layer to handle
            }
        }

        /// <summary>
        /// Deletes a property by its ID from the database.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="KeyNotFoundException"></exception>
        public async Task DeleteAsync(int id)
        {
            try
            {
                var property = await _context.Properties.FindAsync(id);
                if (property == null)
                {
                    throw new KeyNotFoundException($"Property with ID {id} not found.");
                }

                _context.Properties.Remove(property);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occurred while deleting property with ID {id}.");
                throw; // Re-throw for service layer to handle
            }
        }

        /// <summary>
        /// Checks if a property exists by its ID.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> ExistsAsync(int id)
        {
            try
            {
                return await _context.Properties.AnyAsync(p => p.Id == id);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, $"An error occurred while checking existence of property with ID {id}.");
                throw; // Re-throw for service layer to handle
            }
        }
    }
}
