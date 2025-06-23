using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using PropertyTrackerWebAPI.DTOs;
using PropertyTrackerWebAPI.Models;
using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

namespace PropertyTrackerWebAPI.Services;

public sealed class JwtService : IJwtService
{
    private readonly JwtOptions _opt;
    private readonly SymmetricSecurityKey _securityKey;
    private readonly JwtSecurityTokenHandler _handler = new();
    private readonly TimeSpan _clockSkew = TimeSpan.FromSeconds(30);

    // ──────────────────────────────────────────────────────────────────────────────
    // In prod put this in a table
    private static readonly ConcurrentDictionary<string, RefreshInfo> _refresh =
        new(StringComparer.Ordinal);
    private sealed record RefreshInfo(string UserId, string Email, DateTime Expiry, bool Revoked);

    public JwtService(IOptions<JwtOptions> options)
    {
        _opt = options.Value;
        _securityKey = new SymmetricSecurityKey(Convert.FromBase64String(_opt.Key));
    }

    // ───────────────────────────────────  Access token  ──────────────────────────
    public string GenerateAccessToken(string userId, string email, string? role = null)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub,  userId),
            new(JwtRegisteredClaimNames.Email,email),
            new(JwtRegisteredClaimNames.Jti,  Guid.NewGuid().ToString())
        };
        if (!string.IsNullOrEmpty(role))
            claims.Add(new(ClaimTypes.Role, role));

        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = _opt.Issuer,
            Audience = _opt.Audience,
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_opt.ExpirationMinutes),
            SigningCredentials = new SigningCredentials(_securityKey, SecurityAlgorithms.HmacSha256)
        };

        return _handler.WriteToken(_handler.CreateToken(descriptor));
    }

    // ───────────────────────────────────  Refresh token  ─────────────────────────
    public (string token, DateTime expiry) GenerateRefreshToken(string userId, string email)
    {
        Span<byte> bytes = stackalloc byte[64];
        RandomNumberGenerator.Fill(bytes);
        var token = Convert.ToBase64String(bytes)
                    .Replace('+', '-').Replace('/', '_').Replace("=", "");

        var expiry = DateTime.UtcNow.AddDays(_opt.RefreshTokenExpirationDays);
        _refresh[token] = new(userId, email, expiry, false);
        return (token, expiry);
    }

    public RefreshTokenValidationResult ValidateRefreshToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token) || !_refresh.TryGetValue(token, out var info))
            return RefreshTokenValidationResult.Failed("Refresh token not found");

        if (info.Revoked) return RefreshTokenValidationResult.Failed("Token revoked");
        if (info.Expiry <= DateTime.UtcNow) return RefreshTokenValidationResult.Failed("Token expired");

        return RefreshTokenValidationResult.Success(info.UserId, info.Email);
    }

    public void RevokeRefreshToken(string token)
    {
        if (_refresh.TryGetValue(token, out var info))
            _refresh[token] = info with { Revoked = true };
    }

    // ───────────────────────────────────  (optional) manual validate  ────────────
    public ClaimsPrincipal? ValidateToken(string token, bool validateLifetime = true)
    {
        var parameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = _opt.Issuer,
            ValidateAudience = true,
            ValidAudience = _opt.Audience,
            ValidateLifetime = validateLifetime,
            ClockSkew = _clockSkew,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = _securityKey
        };

        try
        {
            return _handler.ValidateToken(token, parameters, out _);
        }
        catch (SecurityTokenException ex)
        {
            // Log or throw the exception here to diagnose the issue
            throw new Exception($"Token validation failed: {ex.Message}", ex);
        }
        catch (Exception ex)
        {
            // Log or throw for unexpected errors
            throw new Exception($"Unexpected error validating token: {ex.Message}", ex);
        }
    }
}