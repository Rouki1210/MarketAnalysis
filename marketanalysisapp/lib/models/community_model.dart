/// Community post model
class CommunityPost {
  final int id;
  final int? authorId;
  final String? authorName;
  final String? authorAvatar;
  final String title;
  final String content;
  final int likesCount;
  final int commentsCount;
  final int viewCount;
  final bool isLiked;
  final bool isBookmarked;
  final DateTime createdAt;
  final DateTime? updatedAt;

  CommunityPost({
    required this.id,
    this.authorId,
    this.authorName,
    this.authorAvatar,
    required this.title,
    required this.content,
    required this.likesCount,
    required this.commentsCount,
    this.viewCount = 0,
    this.isLiked = false,
    this.isBookmarked = false,
    required this.createdAt,
    this.updatedAt,
  });

  factory CommunityPost.fromJson(Map<String, dynamic> json) {
    final author = json['author'] as Map<String, dynamic>?;
    return CommunityPost(
      id: json['id'] as int,
      authorId: author?['id'] as int? ?? json['authorId'] as int?,
      authorName:
          author?['displayName'] as String? ??
          author?['username'] as String? ??
          json['authorName'] as String?,
      authorAvatar:
          author?['avatarEmoji'] as String? ?? json['authorAvatar'] as String?,
      title: json['title'] as String,
      content: json['content'] as String,
      likesCount: (json['likes'] ?? json['likesCount']) as int? ?? 0,
      commentsCount: (json['comments'] ?? json['commentsCount']) as int? ?? 0,
      viewCount: (json['viewCount'] ?? json['views']) as int? ?? 0,
      isLiked: json['isLiked'] as bool? ?? false,
      isBookmarked: json['isBookmarked'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'authorId': authorId,
      'authorName': authorName,
      'authorAvatar': authorAvatar,
      'title': title,
      'content': content,
      'likesCount': likesCount,
      'commentsCount': commentsCount,
      'viewCount': viewCount,
      'isLiked': isLiked,
      'isBookmarked': isBookmarked,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  CommunityPost copyWith({
    int? likesCount,
    int? commentsCount,
    int? viewCount,
    bool? isLiked,
    bool? isBookmarked,
  }) {
    return CommunityPost(
      id: id,
      authorId: authorId,
      authorName: authorName,
      authorAvatar: authorAvatar,
      title: title,
      content: content,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? this.commentsCount,
      viewCount: viewCount ?? this.viewCount,
      isLiked: isLiked ?? this.isLiked,
      isBookmarked: isBookmarked ?? this.isBookmarked,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}

/// Comment model
class Comment {
  final int id;
  final int postId;
  final int? authorId;
  final String? authorName;
  final String? authorAvatar;
  final String content;
  final int likesCount;
  final bool isLiked;
  final DateTime createdAt;

  Comment({
    required this.id,
    required this.postId,
    this.authorId,
    this.authorName,
    this.authorAvatar,
    required this.content,
    required this.likesCount,
    this.isLiked = false,
    required this.createdAt,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'] as int,
      postId: json['postId'] as int,
      authorId: json['authorId'] as int?,
      authorName: json['authorName'] as String?,
      authorAvatar: json['authorAvatar'] as String?,
      content: json['content'] as String,
      likesCount: json['likesCount'] as int? ?? 0,
      isLiked: json['isLiked'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'postId': postId,
      'authorId': authorId,
      'authorName': authorName,
      'authorAvatar': authorAvatar,
      'content': content,
      'likesCount': likesCount,
      'isLiked': isLiked,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

/// Article model
class Article {
  final int id;
  final String title;
  final String? description;
  final String? content;
  final String? imageUrl;
  final String? sourceUrl;
  final String? author;
  final DateTime publishedAt;
  final DateTime createdAt;

  Article({
    required this.id,
    required this.title,
    this.description,
    this.content,
    this.imageUrl,
    this.sourceUrl,
    this.author,
    required this.publishedAt,
    required this.createdAt,
  });

  factory Article.fromJson(Map<String, dynamic> json) {
    // Handle author being a Map or String
    String? authorName;
    if (json['author'] is Map) {
      final authorMap = json['author'] as Map<String, dynamic>;
      authorName =
          authorMap['displayName'] ??
          authorMap['username'] ??
          authorMap['name'];
    } else if (json['author'] is String) {
      authorName = json['author'] as String;
    }

    return Article(
      id: json['id'] as int,
      title: json['title'] as String,
      description: json['description'] as String?,
      content: json['content'] as String?,
      imageUrl: json['imageUrl'] as String?,
      sourceUrl: json['sourceUrl'] as String?,
      author: authorName,
      publishedAt: DateTime.parse(json['publishedAt'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'content': content,
      'imageUrl': imageUrl,
      'sourceUrl': sourceUrl,
      'author': author,
      'publishedAt': publishedAt.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
