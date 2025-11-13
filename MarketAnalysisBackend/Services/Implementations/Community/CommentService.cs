using MarketAnalysisBackend.Models.Community;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Implementations.Community;
using MarketAnalysisBackend.Repositories.Interfaces.Community;
using MarketAnalysisBackend.Services.Interfaces.Community;

namespace MarketAnalysisBackend.Services.Implementations.Community
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepository;
        private readonly ICommunityPostRepository _communityPostRepository;
        private readonly ICommunityNotificationService _notificationService;
        public CommentService(ICommentRepository commentRepository, ICommunityPostRepository communityPostRepository, ICommunityNotificationService notificationService)
        {
            _commentRepository = commentRepository;
            _communityPostRepository = communityPostRepository;
            _notificationService = notificationService;
        }
        public async Task<CommentDto> CreateCommentAsync(CreateCommentDto createCommentDto, int userId)
        {
            var comment = new Comment
            {
                PostId = createCommentDto.PostId,
                UserId = userId,
                Content = createCommentDto.Content,
            };

            var createdComment = await _commentRepository.CreateAsync(comment);

            var post = await _communityPostRepository.GetByIdAsync(createCommentDto.PostId);
            if (post != null && post.UserId != userId)
            {
                await _notificationService.NotifyUserAsync(
                    post.UserId,
                    userId,
                    "comment",
                    "post",
                    createCommentDto.PostId,
                    "commented on your post"
                );
            }

            return await MapToCommentDtoAsync(createdComment, userId);
        }

        public async Task<bool> DeleteCommentAsync(int id, int userId, bool isAdmin = false)
        {
            var comment = await _commentRepository.GetByIdAsync(id);
            if (comment == null)
                return false;

            if (comment.UserId != userId && !isAdmin)
                throw new UnauthorizedAccessException("You can only delete your own comments");

            return await _commentRepository.DeleteAsync(id, softDelete: true);
        }

        public async Task<Comment?> GetCommentByIdAsync(int id)
        {
            return await _commentRepository.GetByIdWithDetailsAsync(id);
        }

        public async Task<List<CommentDto>> GetPostCommentsAsync(int postId, int page = 1, int pageSize = 50, int? currentUserId = null)
        {
            var comments = await _commentRepository.GetPostCommentsAsync(postId, page, pageSize);
            var commentDtos = new List<CommentDto>();

            foreach (var comment in comments)
            {
                commentDtos.Add(await MapToCommentDtoAsync(comment, currentUserId));
            }

            return commentDtos;
        }

        public async Task<List<CommentDto>> GetUserCommentsAsync(int userId, int page = 1, int pageSize = 15)
        {
            var comments = await _commentRepository.GetUserCommentsAsync(userId, page, pageSize);
            var commentDtos = new List<CommentDto>();

            foreach (var comment in comments)
            {
                commentDtos.Add(await MapToCommentDtoAsync(comment, userId));
            }

            return commentDtos;
        }

        public async Task<CommentDto> UpdateCommentAsync(int id, UpdateCommentDto updateCommentDto, int userId)
        {
            var comment = await _commentRepository.GetByIdAsync(id);
            if (comment == null)
                throw new KeyNotFoundException("Comment not found");
            if (comment.UserId != userId)
                throw new UnauthorizedAccessException("You can only update your own comments");

            comment.Content = updateCommentDto.Content;
            var updatedComment = await _commentRepository.UpdateAsync(comment);

            return await MapToCommentDtoAsync(updatedComment, userId);
        }

        private async Task<CommentDto> MapToCommentDtoAsync(Comment comment, int? currentUserId = null)
        {

            return new CommentDto
            {
                Id = comment.Id,
                PostId = comment.PostId,
                Author = new UserBasicDto
                {
                    Id = comment.User?.Id ?? 0,
                    Username = comment.User?.Username ?? "",
                    DisplayName = comment.User?.DisplayName ?? "",
                    AvatarEmoji = comment.User?.AvartarUrl,
                    IsVerified = comment.User?.IsVerified ?? false
                },
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.LastUpdatedAt,
            };
        }
    }
}
