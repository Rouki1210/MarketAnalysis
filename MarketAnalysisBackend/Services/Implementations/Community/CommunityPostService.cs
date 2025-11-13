using MarketAnalysisBackend.Models.Community;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Implementations.Community;
using MarketAnalysisBackend.Repositories.Interfaces.Community;
using MarketAnalysisBackend.Services.Interfaces;
using MarketAnalysisBackend.Services.Interfaces.Community;

namespace MarketAnalysisBackend.Services.Implementations.Community
{
    public class CommunityPostService : ICommunityPostService
    {
        private readonly ICommunityPostRepository _communityPostRepository;
        private readonly IPostReactionRepository _postReactionRepository;
        private readonly IPostBookmarkRepository _postBookmarkRepository;
        private readonly IPostTagRepository _postTagRepository;
        private readonly ICommunityNotification _notificationService;
        private readonly ITopicRepository _topicRepository;
        private readonly IPostTopicRepository _postTopicRepository;
        public CommunityPostService(
            ICommunityPostRepository communityPostRepository,
            IPostReactionRepository postReactionRepository,
            IPostBookmarkRepository postBookmarkRepository,
            IPostTagRepository postTagRepository,
            ITopicRepository topicRepository,
            ICommunityNotification notificationService,
            IPostTopicRepository postTopicRepository
            )
        {
            _communityPostRepository = communityPostRepository;
            _postReactionRepository = postReactionRepository;
            _postBookmarkRepository = postBookmarkRepository;
            _postTagRepository = postTagRepository;
            _topicRepository = topicRepository;
            _notificationService = notificationService;
            _postTopicRepository = postTopicRepository;
        }
        public async Task<CommunityPostDto> CreatePostAsync(CreatePostDto createPostDto, int userId)
        {
            var post = new CommunityPost
            {
                UserId = userId,
                Title = createPostDto.Title,
                Content = createPostDto.Content,
                IsPublished = true,
            };

            var createdPost = await _communityPostRepository.CreateAsync(post);

            if (createPostDto.Tags != null && createPostDto.Tags.Any())
            {
                foreach (var tag in createPostDto.Tags)
                {
                    await _postTagRepository.AddTagToPostAsync(createdPost.Id, tag);
                }
            }

            if (createPostDto.TopicIds != null && createPostDto.TopicIds.Any())
            {
                foreach (var topicId in createPostDto.TopicIds)
                {
                    await _postTopicRepository.AddTopicToPostAsync(createdPost.Id, topicId);
                    await _topicRepository.IncrementPostCountAsync(topicId);
                }
            }

            return await MaptoDtoAsync(createdPost, userId);
        }

        public async Task<bool> DeletePostAsync(int id, int userId, bool isAdmin = false)
        {
            var post = await _communityPostRepository.GetByIdAsync(id);
            if (post == null)
            {
                return false;
            }

            if(post.UserId != userId && !isAdmin)
            {
                throw new UnauthorizedAccessException("You can only delete your own posts");
            }

            var postTopics = await _postTopicRepository.GetPostTopicAsync(id);
            foreach(var postTopic in postTopics)
            {
                await _topicRepository.DecrementPostCountAsync(postTopic.TopicId);
            }

            return await _communityPostRepository.DeleteAsync(id, softDelete: true);
        }

        public async Task<CommunityPost?> GetPostByIdAsync(int id, int? currentUserId = null)
        {
            var post = await _communityPostRepository.GetByIdWithDetailsAsync(id);
            if (post == null)
            {
                return null;
            }

            await _communityPostRepository.IncrementViewCountAsync(id);
            return post;
        }

        public async Task<PaginatedResponse<CommunityPostDto>> GetPostsAsync(PaginationRequest request, int? currentUserId = null)
        {
            var posts = await _communityPostRepository.GetAllAsync(request.Page, request.PageSize);
            var totalCount = await _communityPostRepository.GetTotalCountAsync();

            var postDtos = new List<CommunityPostDto>();
            foreach(var post in posts)
            {
                postDtos.Add(await MaptoDtoAsync(post, currentUserId));
            }

            return new PaginatedResponse<CommunityPostDto>
            {
                Data = postDtos,
                CurrentPage = request.Page,
                PageSize = request.PageSize,
                TotalItems = totalCount,
                TotalPages = (int)Math.Ceiling((double)totalCount / request.PageSize),
                HasPrevious = request.Page > 1,
                HasNext = request.Page < (int)Math.Ceiling((double)totalCount / request.PageSize)
            };
        }

        public async Task<PaginatedResponse<CommunityPostDto>> GetPostsByTopicAsync(int topicId, int page = 1, int pageSize = 15, int? currentUserId = null)
        {
            var posts = await _communityPostRepository.GetByTopicAsync(topicId, page, pageSize);
            var totalCount = posts.Count; 

            var postDtos = new List<CommunityPostDto>();
            foreach (var post in posts)
            {
                postDtos.Add(await MaptoDtoAsync(post, currentUserId));
            }

            return new PaginatedResponse<CommunityPostDto>
            {
                Data = postDtos,
                CurrentPage = page,
                PageSize = pageSize,
                TotalItems = totalCount,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                HasPrevious = page > 1,
                HasNext = page < (int)Math.Ceiling((double)totalCount / pageSize)
            };
        }

        public async Task<List<CommunityPostDto>> GetTrendingPostsAsync(int hours = 24, int limit = 10, int? currentUserId = null)
        {
            var posts = await _communityPostRepository.GetTrendingAsync(hours, limit);
            var postDtos = new List<CommunityPostDto>();

            foreach(var post in posts)
            {
                postDtos.Add(await MaptoDtoAsync(post, currentUserId));
            }

            return postDtos;
        }

        public async Task<PaginatedResponse<CommunityPostDto>> GetUserPostsAsync(int userId, int page = 1, int pageSize = 15, int? currentUserId = null)
        {
            var posts = await _communityPostRepository.GetByUserIdAsync(userId, page, pageSize);
            var totalCount = posts.Count;

            var postDtos = new List<CommunityPostDto>();
            foreach (var post in posts)
            {
                postDtos.Add(await MaptoDtoAsync(post, currentUserId));
            }

            return new PaginatedResponse<CommunityPostDto>
            {
                Data = postDtos,
                CurrentPage = page,
                PageSize = pageSize,
                TotalItems = totalCount,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                HasPrevious = page > 1,
                HasNext = page < (int)Math.Ceiling((double)totalCount / pageSize)
            };
        }

        public async Task<int> IncrementViewCountAsync(int id)
        {
            return await _communityPostRepository.IncrementViewCountAsync(id);
        }

        public async Task<PaginatedResponse<CommunityPostDto>> SearchPostsAsync(string query, int page = 1, int pageSize = 15, int? currentUserId = null)
        {
            var posts =  await _communityPostRepository.SearchAsync(query, page, pageSize);
            var totalCount = posts.Count;

            var postDtos = new List<CommunityPostDto>();
            foreach (var post in posts)
            {
                postDtos.Add(await MaptoDtoAsync(post, currentUserId));
            }

            return new PaginatedResponse<CommunityPostDto>
            {
                Data = postDtos,
                CurrentPage = page,
                PageSize = pageSize,
                TotalItems = totalCount,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                HasPrevious = page > 1,
                HasNext = page < (int)Math.Ceiling((double)totalCount / pageSize)
            };
        }

        public async Task<bool> ToggleBookmarkAsync(int postId, int userId)
        {
            var hasBookmarked = await _postBookmarkRepository.HasUserBookmarkedAsync(postId, userId);

            if (hasBookmarked)
            {
                await _postBookmarkRepository.RemoveBookmarkAsync(postId, userId);
                return false;
            }
            else
            {
                var bookmark = new PostBookmark
                {
                    PostId = postId,
                    UserId = userId
                };

                await _postBookmarkRepository.AddBookmarkAsync(bookmark);
                return true;
            }
        }

        public async Task<bool> ToggleLikeAsync(int postId, int userId)
        {
            var hasLiked = await _postReactionRepository.HasUserReactedAsync(postId, userId, "like");

            if (hasLiked)
            {
                var removed = await _postReactionRepository.RemoveReactionAsync(postId, userId, "like");
                
                return false;
            }
            else
            {
                var reaction = new PostReaction
                {
                    PostId = postId,
                    UserId = userId,
                    ReactionType = "like"
                };

                await _postReactionRepository.AddReactionAsync(reaction);

                var post = await _communityPostRepository.GetByIdAsync(postId);
                if (post != null)
                {

                    // Notify post author
                    if (post.UserId != userId)
                    {
                        await _notificationService.NotifyUserAsync(
                            post.UserId,
                            userId,
                            "like",
                            "post",
                            postId,
                            "liked your post"
                        );
                    }
                }

                return true;
            }
        }

        public async Task<bool> TogglePinPostAsync(int id, int userId, bool isAdmin = false)
        {
            if (!isAdmin)
                throw new UnauthorizedAccessException("Only admins can pin posts");

            return await _communityPostRepository.TogglePinAsync(id);
        }

        public async Task<CommunityPostDto> UpdatePostAsync(int id, UpdatePostDto updatePostDto, int userId)
        {
            var post = await _communityPostRepository.GetByIdAsync(id);
            if (post == null)
            {
                throw new KeyNotFoundException("Post not found");
            }

            if (post.UserId != userId)
                throw new UnauthorizedAccessException("You can only edit your own posts");

            if (!string.IsNullOrEmpty(updatePostDto.Title))
                post.Title = updatePostDto.Title;

            if (!string.IsNullOrEmpty(updatePostDto.Content))
                post.Content = updatePostDto.Content;

            if (updatePostDto.Tags != null)
            {
                await _postTagRepository.RemoveAllTagsFromPostAsync(id);
                foreach (var tag in updatePostDto.Tags)
                {
                    await _postTagRepository.AddTagToPostAsync(id, tag);
                }
            }

            if(updatePostDto.TopicIds != null)
            {
                var existingTopics = await _postTopicRepository.GetPostTopicAsync(id);
                await _postTopicRepository.RemoveAllTopicsFromPostAsync(id);

                foreach (var topicId in updatePostDto.TopicIds)
                {
                    await _postTopicRepository.AddTopicToPostAsync(id, topicId);
                    await _topicRepository.IncrementPostCountAsync(topicId);
                }

                foreach (var existingTopic in existingTopics)
                {
                    if (!updatePostDto.TopicIds.Contains(existingTopic.TopicId))
                    {
                        await _topicRepository.DecrementPostCountAsync(existingTopic.TopicId);
                    }
                }
            }

            var updatedPost = await _communityPostRepository.UpdateAsync(post);
            return await MaptoDtoAsync(updatedPost, userId);
        }

        private async Task<CommunityPostDto> MaptoDtoAsync(CommunityPost post, int? currentUserId = null)
        {
            var isLiked = false;
            var isBookmarked = false;

            if (currentUserId.HasValue)
            {
                isLiked = await _postReactionRepository.HasUserReactedAsync(post.Id, currentUserId.Value, "like");
                isBookmarked = await _postBookmarkRepository.HasUserBookmarkedAsync(post.Id, currentUserId.Value);
            }

            var tags = await _postTagRepository.GetPostTagsAsync(post.Id);
            var postTopics = await _postTopicRepository.GetPostTopicAsync(post.Id);

            return new CommunityPostDto
            {
                Id = post.Id,
                Title = post.Title,
                Content = post.Content,
                Author = new UserBasicDto
                {
                    Id = post.User?.Id ?? 0,
                    Username = post.User?.Username ?? "",
                    DisplayName = post.User?.DisplayName ?? "",
                    AvatarEmoji = post.User?.AvartarUrl ?? "",
                    IsVerified = post.User?.IsVerified ?? false
                },
                Likes = post.Reactions?.Count(r => r.ReactionType == "like") ?? 0,
                Comments = post.Comments?.Count ?? 0,
                Bookmarks = post.Bookmarks?.Count ?? 0,
                ViewCount = post.ViewCount,
                IsPinned = post.IsPinned,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt,
                Tags = tags.Select(t => t.TagName).ToList(),
                Topics = postTopics.Select(p => new TopicBasicDto
                {
                    Id = p.Topic?.Id ?? 0,
                    Name = p.Topic?.Name ?? "",
                    Slug = p.Topic?.Slug ?? "",
                    Icon = p.Topic?.Icon ?? ""
                }).ToList(),
                IsLiked = isLiked,
                IsBookmarked = isBookmarked
            };
        }
    }
}
