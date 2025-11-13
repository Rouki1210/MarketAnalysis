using MarketAnalysisBackend.Models.Community;
using MarketAnalysisBackend.Models.DTO;
using MarketAnalysisBackend.Repositories.Implementations.Community;
using MarketAnalysisBackend.Repositories.Interfaces.Community;
using MarketAnalysisBackend.Services.Interfaces.Community;

namespace MarketAnalysisBackend.Services.Implementations.Community
{
    public class TopicService : ITopicService
    {
        private readonly ITopicRepository _topicRepository;
        private readonly ITopicFollowRepository _topicFollowRepository;
        public TopicService(ITopicRepository topicRepository, ITopicFollowRepository topicFollowRepository)
        {
            _topicRepository = topicRepository;
            _topicFollowRepository = topicFollowRepository;
        }
        public async Task<TopicDto> CreateTopicAsync(CreateTopicDto createTopicDto)
        {
            var topic = new Topic
            {
                Name = createTopicDto.Name,
                Icon = createTopicDto.Icon,
                Description = createTopicDto.Description,
            };

            var createdTopic = await _topicRepository.CreateAsync(topic);
            return new TopicDto
            {
                Id = createdTopic.Id,
                Name = createdTopic.Name,
                Slug = createdTopic.Slug,
                Icon = createdTopic.Icon,
                Description = createdTopic.Description,
                PostCount = createdTopic.PostCount,
                FollowerCount = createdTopic.FollowerCount,
                IsFollowing = false,
                CreatedAt = createdTopic.CreatedAt
            };
        }

        public async Task<bool> DeleteTopicAsync(int id)
        {
            return await _topicRepository.DeleteAsync(id);
        }

        public async Task<bool> FollowTopicAsync(int topicId, int userId)
        {
            var isAlreadyFollowing = await _topicFollowRepository.IsFollowingTopicAsync(topicId, userId);
            if (isAlreadyFollowing)
                return false;

            await _topicFollowRepository.FollowTopicAsync(topicId, userId);
            return true;
        }

        public async Task<List<TopicDto>> GetAllTopicsAsync()
        {
            var topics = await _topicRepository.GetAllAsync();

            return topics.Select(t => new TopicDto
            {
                Id = t.Id,
                Name = t.Name,
                Slug = t.Slug,
                Icon = t.Icon,
                Description = t.Description,
                PostCount = t.PostCount,
                FollowerCount = t.FollowerCount,
                IsFollowing = false,
                CreatedAt = t.CreatedAt
            }).ToList();
        }

        public async Task<List<TopicDto>> GetPopularTopicsAsync(int limit = 10)
        {
            var topics = await _topicRepository.GetPopularAsync(limit);

            return topics.Select(t => new TopicDto
            {
                Id = t.Id,
                Name = t.Name,
                Slug = t.Slug,
                Icon = t.Icon,
                Description = t.Description,
                PostCount = t.PostCount,
                FollowerCount = t.FollowerCount,
                IsFollowing = false,
                CreatedAt = t.CreatedAt
            }).ToList();
        }

        public async Task<Topic?> GetTopicByIdAsync(int id)
        {
            return await _topicRepository.GetByIdAsync(id);
        }

        public async Task<Topic?> GetTopicBySlugAsync(string slug)
        {
            return await _topicRepository.GetBySlugAsync(slug);
        }

        public async Task<bool> IsFollowingTopicAsync(int topicId, int userId)
        {
            return await _topicFollowRepository.IsFollowingTopicAsync(topicId, userId);
        }

        public async Task<bool> UnfollowTopicAsync(int topicId, int userId)
        {
            return await _topicFollowRepository.UnfollowTopicAsync(topicId, userId);
        }

        public async Task<TopicDto> UpdateTopicAsync(int id, UpdateTopicDto updateTopicDto)
        {
            var topic = await _topicRepository.GetByIdAsync(id);
            if (topic == null)
                throw new KeyNotFoundException("Topic not found");
            if(!string.IsNullOrEmpty(updateTopicDto.Name))
                topic.Name = updateTopicDto.Name;
            if(!string.IsNullOrEmpty(updateTopicDto.Icon))
                topic.Icon = updateTopicDto.Icon;
            if(!string.IsNullOrEmpty(updateTopicDto.Description))
                topic.Description = updateTopicDto.Description;

            var updatedTopic = await _topicRepository.UpdateAsync(topic);

            return new TopicDto
            {
                Id = updatedTopic.Id,
                Name = updatedTopic.Name,
                Slug = updatedTopic.Slug,
                Icon = updatedTopic.Icon,
                Description = updatedTopic.Description,
                PostCount = updatedTopic.PostCount,
                FollowerCount = updatedTopic.FollowerCount,
                IsFollowing = false,
                CreatedAt = updatedTopic.CreatedAt
            };
        }
    }
}
