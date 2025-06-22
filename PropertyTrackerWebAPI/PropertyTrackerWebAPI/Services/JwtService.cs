using Microsoft.IdentityModel.Tokens;
using PropertyTrackerWebAPI.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace PropertyTrackerWebAPI.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;
        private readonly SymmetricSecurityKey _securityKey;

        // In-memory store for refresh tokens (for demo purposes)
        // In production, use a database or Redis
        private static readonly Dictionary<string, RefreshTokenInfo> _refreshTokens = new();

        private class RefreshTokenInfo
        {
            public string UserId { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public DateTime Expiry { get; set; }
        }

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
            _securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        }

        public string GenerateAccessToken(string userId, string email)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
                new Claim(ClaimTypes.Name, email),
                new Claim(ClaimTypes.Role, "User") // Consider making this dynamic based on user
            };

            // Add multiple audience claims
            var audiences = _configuration.GetSection("Jwt:Audiences").Get<string[]>();
            if (audiences != null && audiences.Length > 0)
            {
                foreach (var audience in audiences)
                {
                    claims.Add(new Claim(JwtRegisteredClaimNames.Aud, audience));
                }
            }
            else
            {
                // Fallback to single audience if Audiences array is not configured
                var singleAudience = _configuration["Jwt:Audience"];
                if (!string.IsNullOrEmpty(singleAudience))
                {
                    claims.Add(new Claim(JwtRegisteredClaimNames.Aud, singleAudience));
                }
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Issuer = _configuration["Jwt:Issuer"],
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(GetTokenExpiryMinutes()),
                SigningCredentials = new SigningCredentials(_securityKey, SecurityAlgorithms.HmacSha256)
                // Note: Don't set Audience here since we're adding audience claims manually
            };

            return new JwtSecurityTokenHandler().CreateEncodedJwt(tokenDescriptor);
        }

        public (string Token, DateTime Expiry) GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            var token = Convert.ToBase64String(randomNumber);
            var expiry = DateTime.UtcNow.AddDays(3); // 3-day expiry for refresh token
            return (token, expiry);
        }

        public (string Token, DateTime Expiry) GenerateRefreshToken(string userId, string email)
        {
            var (token, expiry) = GenerateRefreshToken();

            // Store the refresh token info (in production, use database)
            _refreshTokens[token] = new RefreshTokenInfo
            {
                UserId = userId,
                Email = email,
                Expiry = expiry
            };

            return (token, expiry);
        }

        public RefreshTokenValidationResult ValidateRefreshToken(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return new RefreshTokenValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "Refresh token is empty"
                };
            }

            // Check if refresh token exists in our store
            if (!_refreshTokens.TryGetValue(refreshToken, out var tokenInfo))
            {
                return new RefreshTokenValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "Refresh token not found"
                };
            }

            // Check if refresh token is expired
            if (tokenInfo.Expiry <= DateTime.UtcNow)
            {
                // Remove expired token
                _refreshTokens.Remove(refreshToken);
                return new RefreshTokenValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "Refresh token has expired"
                };
            }

            return new RefreshTokenValidationResult
            {
                IsValid = true,
                UserId = tokenInfo.UserId,
                Email = tokenInfo.Email
            };
        }

        public ClaimsPrincipal? ValidateToken(string token, bool validateLifetime = true)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                // Get audiences from configuration for validation
                var audiences = _configuration.GetSection("Jwt:Audiences").Get<string[]>();
                var validAudiences = audiences?.Length > 0 ? audiences : new[] { _configuration["Jwt:Audience"]! };

                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = validateLifetime,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidAudiences = validAudiences,
                    IssuerSigningKey = _securityKey,
                    ClockSkew = TimeSpan.FromSeconds(30) // small tolerance
                }, out _);
                return principal;
            }
            catch
            {
                return null;
            }
        }

        public string? GetUserIdFromToken(string token)
        {
            var principal = ValidateToken(token);
            return principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? principal?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        }

        public bool IsTokenExpired(string token)
        {
            var jwtToken = new JwtSecurityTokenHandler().ReadJwtToken(token);
            return jwtToken.ValidTo < DateTime.UtcNow;
        }

        private int GetTokenExpiryMinutes()
        {
            if (!int.TryParse(_configuration["Jwt:ExpirationMinutes"], out var minutes) || minutes <= 0)
            {
                return 15; // Default fallback
            }
            return minutes;
        }
    }
}