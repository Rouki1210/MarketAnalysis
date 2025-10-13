using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;
        public UserRepository(AppDbContext context)
        {
            _context = context;
        }
        public void Add(User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
        }

        public User? GetByUsername(string username)
        {
            return _context.Users.AsNoTracking().FirstOrDefault(u => u.Username == username);
        }
        public User? GetByEmail(string email)
        {
            return _context.Users.AsNoTracking().FirstOrDefault(u => u.Email == email);
        }
    }
}
