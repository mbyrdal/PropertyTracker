using PropertyTrackerWebAPI.Models;

namespace PropertyTrackerWebAPI.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetUserByIdAsync(int userId);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User?> GetUserByUsernameAsync(string username);
        Task<bool> EmailExistsAsync(string email);
        Task<bool> UsernameExistsAsync(string username);
        Task CreateUserAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteUserAsync(int userId);
    }
}
