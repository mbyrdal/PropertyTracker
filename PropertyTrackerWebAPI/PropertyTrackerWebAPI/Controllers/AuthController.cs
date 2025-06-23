using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertyTrackerWebAPI.DTOs;
using PropertyTrackerWebAPI.Models;
using PropertyTrackerWebAPI.Repositories;
using PropertyTrackerWebAPI.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace PropertyTrackerWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly IUserRepository _users;
    private readonly IPasswordService _pwd;
    private readonly IJwtService _jwt;
    private readonly ILogger<AuthController> _log;

    public AuthController(
        IUserRepository users,
        IPasswordService pwd,
        IJwtService jwt,
        ILogger<AuthController> log)
    {
        _users = users;
        _pwd = pwd;
        _jwt = jwt;
        _log = log;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    //  POST api/auth/login   (anonymous)
    // ─────────────────────────────────────────────────────────────────────────────
    [HttpPost("login"), AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await _users.GetUserByEmailAsync(dto.Email);
        if (user is null || !_pwd.VerifyPassword(dto.Password, user.PasswordHash))
            return Unauthorized(new { Message = "Invalid credentials" });

        var access = _jwt.GenerateAccessToken(user.Id.ToString(), user.Email, user.Role);
        var (refresh, refreshExp) = _jwt.GenerateRefreshToken(user.Id.ToString(), user.Email);

        _log.LogInformation("User {Email} logged in", user.Email);

        return Ok(new LoginResponse
        {
            AccessToken = access,
            RefreshToken = refresh,
            RefreshTokenExpiry = refreshExp,
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role
        });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    //  POST api/auth/register   (anonymous)
    // ─────────────────────────────────────────────────────────────────────────────
    [HttpPost("register"), AllowAnonymous]
    [ProducesResponseType(typeof(RegisterResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        if (await _users.GetUserByEmailAsync(dto.Email) is not null)
            return BadRequest(new { Message = "Email already registered" });

        var user = new User
        {
            Email = dto.Email,
            Username = dto.Username,
            PasswordHash = _pwd.HashPassword(dto.Password),
            Role = "User",
            CreatedAt = DateTime.UtcNow
        };

        await _users.CreateUserAsync(user);

        return CreatedAtAction(nameof(Login), new RegisterResponse
        {
            Id = user.Id,
            Email = user.Email,
            Username = user.Username,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        });
    }

    [HttpGet("verify"), Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Verify()
    {
        var expSeconds = long.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Exp)!);
        var expUtc = DateTimeOffset.FromUnixTimeSeconds(expSeconds).UtcDateTime;

        return Ok(new
        {
            UserId = User.FindFirstValue(ClaimTypes.NameIdentifier),
            Email = User.FindFirstValue(ClaimTypes.Email),
            ExpiresAt = expUtc
        });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    //  POST api/auth/refresh   (anonymous, uses refresh token)
    // ─────────────────────────────────────────────────────────────────────────────
    [HttpPost("refresh"), AllowAnonymous]
    [ProducesResponseType(typeof(RefreshTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status401Unauthorized)]
    public IActionResult Refresh([FromBody] RefreshTokenRequest dto)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken))
            return Unauthorized(new { Message = "Refresh token is required" });

        var result = _jwt.ValidateRefreshToken(dto.RefreshToken);
        if (!result.IsValid)
            return Unauthorized(new { Message = result.ErrorMessage ?? "Invalid refresh token" });

        var access = _jwt.GenerateAccessToken(result.UserId!, result.Email!);
        var (newRefresh, newExp) = _jwt.GenerateRefreshToken(result.UserId!, result.Email!);

        _jwt.RevokeRefreshToken(dto.RefreshToken);

        return Ok(new RefreshTokenResponse
        {
            AccessToken = access,
            RefreshToken = newRefresh,
            ExpiresAt = newExp
        });
    }
}