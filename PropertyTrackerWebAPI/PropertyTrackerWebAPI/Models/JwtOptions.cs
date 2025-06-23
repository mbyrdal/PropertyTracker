namespace PropertyTrackerWebAPI.Models
{
    public sealed class JwtOptions
    {
        public string Key { get; init; } = null!;   // Base-64 string
        public string Issuer { get; init; } = null!;
        public string Audience { get; init; } = null!;
        public int ExpirationMinutes { get; init; }
        public int RefreshTokenExpirationDays { get; init; }
    }
}
