using MarketAnalysisBackend.Repositories.Interfaces.Community;
using Microsoft.AspNetCore.Mvc;

namespace MarketAnalysisBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommunityPostController : Controller
    {
        private readonly ICommunityPostRepository _post;
        public CommunityPostController(ICommunityPostRepository post)
        {
            _post = post;
        }
        [HttpGet]
        public async Task<IActionResult> GetAllPosts()
        {
            var posts = await _post.GetAllAsync();
            return Ok(posts);
        }
    }
}
