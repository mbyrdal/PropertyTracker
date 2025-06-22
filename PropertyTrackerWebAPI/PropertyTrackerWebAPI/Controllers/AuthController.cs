using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PropertyTrackerWebAPI.DTOs;
using PropertyTrackerWebAPI.Models;
using PropertyTrackerWebAPI.Repositories;
using PropertyTrackerWebAPI.Services;

namespace PropertyTrackerWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordService _passwordService;
        private readonly IJwtService _jwtService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IUserRepository userRepository,
                              IPasswordService passwordService,
                              IJwtService jwtService,
                              ILogger<AuthController> logger)
        {
            _userRepository = userRepository;
            _passwordService = passwordService;
            _jwtService = jwtService;
            _logger = logger;
        }

        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Validate the input
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Find user by email
                var user = await _userRepository.GetUserByEmailAsync(request.Email);
                if (user == null)
                {
                    _logger.LogWarning($"Login attempt for non-existent email: {request.Email}");
                    return Unauthorized(new { Message = "Invalid email." });
                }

                // Verify password
                if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
                {
                    _logger.LogWarning($"Login attempt failed for user: {user.Email}");
                    return Unauthorized(new { Message = "Invalid credentials." });
                }

                // Generate tokens
                var accessToken = _jwtService.GenerateAccessToken(user.Id.ToString(), user.Email);

                var refreshToken = _jwtService.GenerateRefreshToken();

                _logger.LogInformation($"User {user.Email} logged in successfully");

                return Ok(new LoginResponse
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    UserId = user.Id,
                    Email = user.Email,
                    Role = user.Role
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, new { Message = "An error occurred during login." });
            }
        }

        [HttpPost("register")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<RegisterResponse>> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check if email exists
            if (await _userRepository.GetUserByEmailAsync(request.Email) != null)
                return BadRequest(new { Message = "Email already registered" });

            // Create new user
            var user = new User
            {
                Email = request.Email,
                Username = request.Username,
                PasswordHash = _passwordService.HashPassword(request.Password),
                Role = "User", // Default role
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.CreateUserAsync(user);

            return CreatedAtAction(nameof(Login), new RegisterResponse 
            { 
                Id = user.Id,
                Email = user.Email,
                Username = user.Username,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            });
        }
    }
}
