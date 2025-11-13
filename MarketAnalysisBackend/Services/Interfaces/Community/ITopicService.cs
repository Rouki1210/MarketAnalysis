using MarketAnalysisBackend.Models.Community;
using MarketAnalysisBackend.Models.DTO;

namespace MarketAnalysisBackend.Services.Interfaces.Community
{
    public interface ITopicService
    {
        Task<Topic?> GetTopicByIdAsync(int id);
        Task<Topic?> GetTopicBySlugAsync(string slug);
        Task<List<TopicDto>> GetAllTopicsAsync();
        Task<List<TopicDto>> GetPopularTopicsAsync(int limit = 10);
        Task<TopicDto> CreateTopicAsync(CreateTopicDto createTopicDto);
        Task<TopicDto> UpdateTopicAsync(int id, UpdateTopicDto updateTopicDto);
        Task<bool> DeleteTopicAsync(int id);
        Task<bool> FollowTopicAsync(int topicId, int userId);
        Task<bool> UnfollowTopicAsync(int topicId, int userId);
        Task<bool> IsFollowingTopicAsync(int topicId, int userId);
    }
}
