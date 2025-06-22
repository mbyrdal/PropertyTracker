using System.Security.Claims;

namespace PropertyTrackerWebAPI.Services
{
    public interface IJwtService
    {
        string GenerateAccessToken(string userId, string email);
        (string Token, DateTime Expiry) GenerateRefreshToken();
        ClaimsPrincipal? ValidateToken(string token, bool validateLifetime = true);
        string? GetUserIdFromToken(string token);
        bool IsTokenExpired(string token);
    }
}
