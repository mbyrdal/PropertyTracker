namespace PropertyTrackerWebAPI.DTOs
{
    public class RefreshTokenValidationResult
    {
        public bool IsValid { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? ErrorMessage { get; set; }
    }
}
