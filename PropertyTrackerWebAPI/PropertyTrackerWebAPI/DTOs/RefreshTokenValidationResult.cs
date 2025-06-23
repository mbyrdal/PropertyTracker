namespace PropertyTrackerWebAPI.DTOs
{
    public class RefreshTokenValidationResult
    {
        public bool IsValid { get; private set; }
        public string UserId { get; private set; } = string.Empty;
        public string Email { get; private set; } = string.Empty;
        public string? ErrorMessage { get; private set; }
        public DateTime? Expiry { get; private set; }

        // Private constructor to enforce use of factory methods
        private RefreshTokenValidationResult() { }

        /// <summary>
        /// Creates a successful validation result
        /// </summary>
        public static RefreshTokenValidationResult Success(string userId, string email, DateTime? expiry = null)
        {
            return new RefreshTokenValidationResult
            {
                IsValid = true,
                UserId = userId,
                Email = email,
                Expiry = expiry
            };
        }

        /// <summary>
        /// Creates a failed validation result
        /// </summary>
        public static RefreshTokenValidationResult Failed(string errorMessage)
        {
            return new RefreshTokenValidationResult
            {
                IsValid = false,
                ErrorMessage = errorMessage
            };
        }

        /// <summary>
        /// Creates a failed validation result with additional details
        /// </summary>
        public static RefreshTokenValidationResult Failed(string errorMessage, string userId, string email)
        {
            return new RefreshTokenValidationResult
            {
                IsValid = false,
                ErrorMessage = errorMessage,
                UserId = userId,
                Email = email
            };
        }
    }
}