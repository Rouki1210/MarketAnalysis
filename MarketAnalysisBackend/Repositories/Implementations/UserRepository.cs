using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Migrations;
using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        private readonly AppDbContext _context;
        public UserRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }
        public async Task CreateAsync(User user)
        {
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        public Task DeleteAllAsync()
        {
            _context.RemoveRange(_context.Users);
            return _context.SaveChangesAsync();
        }

        public async Task<User?> GetByEmailOrUsernameAsync(string emailOrUsername)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == emailOrUsername || u.Username == emailOrUsername);
        }

       
    }
}
