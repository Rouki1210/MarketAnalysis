/// API endpoint constants
class ApiEndpoints {
  // Auth endpoints
  static const String login = '/Auth/login';
  static const String register = '/Auth/register';
  static const String googleAuth = '/Auth/google';
  static const String walletRequestNonce = '/Auth/wallet/request-nonce';
  static const String walletLogin = '/Auth/wallet/login';

  // User endpoints
  static String userInfo(String token) => '/User/userInfo/$token';
  static const String updateProfile = '/User/updateProfile';

  // Alerts
  static const String alerts = '/Alert';

  // Notifications
  static const String notifications = '/Notification';

  // Asset endpoints
  static const String assets = '/Asset';
  static String assetBySymbol(String symbol) => '/Asset/$symbol';

  // Price endpoints
  static const String prices = '/Prices';
  static String pricesBySymbol(String symbol) => '/Prices/$symbol';

  // Watchlist endpoints
  static const String watchlists = '/Watchlist';
  static String watchlistsByUser(String userId) => '/Watchlist/user/$userId';
  static String createWatchlist(String userId) => '/Watchlist/$userId/create';
  static String watchlistById(int id) => '/Watchlist/$id';
  static String watchlistItems(int watchlistId) =>
      '/Watchlist/$watchlistId/items';

  // Alert endpoints
  static const String globalAlerts = '/Alert/global';
  static const String userAlerts = '/Alert/user';
  static String userAlertById(int id) => '/Alert/user/$id';
  static const String alertHistory = '/Alert/history';

  // Community endpoints
  static const String communityPosts = '/CommunityPost';
  static String communityPostById(int id) => '/CommunityPost/$id';
  static String postComments(int postId) => '/Comment/post/$postId';
  static const String comments = '/Comment';

  // Article endpoints
  static const String articles = '/Articles';
  static String articleById(int id) => '/Articles/$id';

  // Topic endpoints
  static const String topics = '/Topic';
  static String topicById(int id) => '/Topic/$id';

  // Global metrics
  static const String globalMetrics = '/GlobalMetric';
}
