using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models;
using MarketAnalysisBackend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations
{
    public class NonceRepository : GenericRepository<Nonce>, INonceRepository 
    {
        private readonly AppDbContext _context;
        public NonceRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Nonce?> GetByWalletAndNonceAsync(string walletAddress, string nonce)
        {
            return await _context.Nonces
                .FirstOrDefaultAsync(n =>
                    n.WalletAddress == walletAddress.ToLower() &&
                    n.NonceValue == nonce);
        }
        public async Task CreateAsync(Nonce nonce)
        {
            await _context.Nonces.AddAsync(nonce);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteExpiredAsync()
        {
            var expiredNonces = _context.Nonces.Where(n => n.ExpireAt < DateTime.UtcNow);
            _context.Nonces.RemoveRange(expiredNonces);
            await _context.SaveChangesAsync();
        }
    }
}
