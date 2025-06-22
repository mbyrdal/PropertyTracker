using PropertyTrackerWebAPI.DTOs;
using System.Security.Claims;

namespace PropertyTrackerWebAPI.Services
{
    public interface IJwtService
    {
        string GenerateAccessToken(string userId, string email);
        (string Token, DateTime Expiry) GenerateRefreshToken();
        (string Token, DateTime Expiry) GenerateRefreshToken(string userId, string email); // Add this overload
        ClaimsPrincipal? ValidateToken(string token, bool validateLifetime = true);
        string? GetUserIdFromToken(string token);
        bool IsTokenExpired(string token);
        RefreshTokenValidationResult ValidateRefreshToken(string refreshToken);
    }
}
