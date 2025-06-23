using PropertyTrackerWebAPI.DTOs;
using System.Security.Claims;

namespace PropertyTrackerWebAPI.Services
{
    public interface IJwtService
    {
        // ──────────────────────────────────────────────
        //  Token creation
        // ──────────────────────────────────────────────
        string GenerateAccessToken(string userId, string email, string? role = null);
        (string token, DateTime expiry) GenerateRefreshToken(string userId, string email);

        // ──────────────────────────────────────────────
        //  Validation  (rarely needed at runtime now
        //  because middleware already does it, but
        //  handy for unit tests or diagnostics)
        // ──────────────────────────────────────────────
        ClaimsPrincipal? ValidateToken(string token, bool validateLifetime = true);

        // ──────────────────────────────────────────────
        //  Refresh-token support
        // ──────────────────────────────────────────────
        RefreshTokenValidationResult ValidateRefreshToken(string refreshToken);
        void RevokeRefreshToken(string refreshToken);
    }
}
