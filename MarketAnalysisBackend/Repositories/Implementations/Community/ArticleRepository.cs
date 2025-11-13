using MarketAnalysisBackend.Data;
using MarketAnalysisBackend.Models.Community;
using MarketAnalysisBackend.Repositories.Interfaces.Community;
using Microsoft.EntityFrameworkCore;

namespace MarketAnalysisBackend.Repositories.Implementations.Community
{
    public class ArticleRepository : IArticleRepository
    {
        private readonly AppDbContext _context;
        public ArticleRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Article> CreateAsync(Article article)
        {
            article.CreatedAt = DateTime.UtcNow;
            article.UpdatedAt = DateTime.UtcNow;

            if (article.IsPublished && article.PublishedAt == null)
            {
                article.PublishedAt = DateTime.UtcNow;
            }

            await _context.Articles.AddAsync(article);
            await _context.SaveChangesAsync();

            return article;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null)
                return false;

            _context.Articles.Remove(article);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<Article>> GetAllAsync(int page = 1, int pageSize = 15)
        {
            return await _context.Articles
                .Include(a => a.Author)
                .OrderByDescending(a => a.PublishedAt ?? a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<List<Article>> GetByCategoryAsync(string category, int page = 1, int pageSize = 15)
        {
            return await _context.Articles
                .Include(a => a.Author)
                .Where(a => a.Category == category)
                .OrderByDescending(a => a.PublishedAt ?? a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<Article?> GetByIdAsync(int id)
        {
            return await _context.Articles.Include(a => a.Author)
                                          .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<List<Article>> GetPublishedAsync(int page = 1, int pageSize = 15)
        {
            return await _context.Articles
                .Include(a => a.Author)
                .Where(a => a.IsPublished && a.PublishedAt != null)
                .OrderByDescending(a => a.PublishedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> IncrementViewCountAsync(int id)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null)
                return 0;

            article.ViewCount++;
            await _context.SaveChangesAsync();

            return article.ViewCount;
        }

        public async Task<Article> UpdateAsync(Article article)
        {
            article.UpdatedAt = DateTime.UtcNow;

            if (article.IsPublished && article.PublishedAt == null)
            {
                article.PublishedAt = DateTime.UtcNow;
            }

            _context.Articles.Update(article);
            await _context.SaveChangesAsync();

            return article;
        }
    }
}
