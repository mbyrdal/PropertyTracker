using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PropertyTrackerWebAPI.DTOs;
using PropertyTrackerWebAPI.Services;

namespace PropertyTrackerWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertyController : ControllerBase
    {
        private readonly IPropertyService _propertyService;
        private readonly ILogger<PropertyController> _logger;

        public PropertyController(IPropertyService propertyService, ILogger<PropertyController> logger)
        {
            _propertyService = propertyService;
            _logger = logger;
        }

        // GET: api/property
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PropertyDto>>> GetProperties()
        {
            try
            {
                _logger.LogInformation("Getting all properties");
                var properties = await _propertyService.GetAllPropertiesAsync();
                _logger.LogInformation($"Retrieved {properties.Count()} properties");
                return Ok(properties);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching properties. Full stack: {StackTrace}", ex.ToString());
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/property/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PropertyDetailDto>> GetProperty(int id)
        {
            try
            {
                var property = await _propertyService.GetPropertyByIdAsync(id);

                if (property == null)
                {
                    return NotFound();
                }

                return Ok(property);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting property with ID {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/property
        [HttpPost]
        public async Task<ActionResult<PropertyDto>> CreateProperty(PropertyCreateDto propertyDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdProperty = await _propertyService.CreatePropertyAsync(propertyDto);
                return CreatedAtAction(nameof(GetProperty), new { id = createdProperty.Id }, createdProperty);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error when creating property");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating property");
                return StatusCode(500, "Internal server error");
            }
        }

        // PUT: api/property/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProperty(int id, PropertyUpdateDto propertyDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (!await _propertyService.PropertyExistsAsync(id))
                {
                    return NotFound();
                }

                await _propertyService.UpdatePropertyAsync(id, propertyDto);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error when updating property");
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, $"Business rule violation when updating property {id}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating property {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        // DELETE: api/property/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProperty(int id)
        {
            try
            {
                if (!await _propertyService.PropertyExistsAsync(id))
                {
                    return NotFound();
                }

                await _propertyService.DeletePropertyAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, $"Business rule violation when deleting property {id}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting property {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        /* TODO: ADD FUNCTIONALITY TO ADD TENANT TO PROPERTY IN DAL AND BLL
        // POST: api/property/{propertyId}/tenants
        public async Task<ActionResult<TenantDto>> AddTenantToProperty(int propertyId, TenantCreateDto tenantDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if(!await _propertyService.PropertyExistsAsync(propertyId))
                {
                    return NotFound("Property not found");
                }

                // Add validation for monthly rent if needed
                if(tenantDto.MonthlyRent <= 0)
                {
                    return BadRequest("Monthly rent must be a positive value.");
                }

                

            }
            catch(ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error when adding tenant to property");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error adding tenant to property {propertyId}");
                return StatusCode(500, "Internal server error");
            }   
        } */
    }
}
