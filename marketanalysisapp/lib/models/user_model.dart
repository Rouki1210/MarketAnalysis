/// User model
class User {
  final int id;
  final String email;
  final String? username;
  final String? displayName;
  final String? walletAddress;
  final String? profilePictureUrl;
  final String? bio;
  final DateTime? birthday;
  final String? website;
  final DateTime createdAt;
  final DateTime? updatedAt;

  User({
    required this.id,
    required this.email,
    this.username,
    this.displayName,
    this.walletAddress,
    this.profilePictureUrl,
    this.bio,
    this.birthday,
    this.website,
    required this.createdAt,
    this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      email: json['email'] as String,
      username: json['username'] as String?,
      displayName: json['displayName'] as String?,
      walletAddress: json['walletAddress'] as String?,
      profilePictureUrl: json['profilePictureUrl'] as String?,
      bio: json['bio'] as String?,
      birthday: json['birthday'] != null
          ? DateTime.parse(json['birthday'] as String)
          : null,
      website: json['website'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'username': username,
      'displayName': displayName,
      'walletAddress': walletAddress,
      'profilePictureUrl': profilePictureUrl,
      'bio': bio,
      'birthday': birthday?.toIso8601String(),
      'website': website,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  User copyWith({
    int? id,
    String? email,
    String? username,
    String? displayName,
    String? walletAddress,
    String? profilePictureUrl,
    String? bio,
    DateTime? birthday,
    String? website,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      username: username ?? this.username,
      displayName: displayName ?? this.displayName,
      walletAddress: walletAddress ?? this.walletAddress,
      profilePictureUrl: profilePictureUrl ?? this.profilePictureUrl,
      bio: bio ?? this.bio,
      birthday: birthday ?? this.birthday,
      website: website ?? this.website,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

/// Authentication response model
class AuthResponse {
  final String token;
  final User? user;
  final String? email;
  final String? message;

  AuthResponse({required this.token, this.user, this.email, this.message});

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'] as String,
      user: json['user'] != null
          ? User.fromJson(json['user'] as Map<String, dynamic>)
          : null,
      email: json['email'] as String?,
      message: json['message'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'token': token,
      'user': user?.toJson(),
      'email': email,
      'message': message,
    };
  }
}

/// Basic user info model
class UserBasic {
  final int id;
  final String username;
  final String displayName;
  final String? avatarEmoji;
  final bool isVerified;

  UserBasic({
    required this.id,
    required this.username,
    required this.displayName,
    this.avatarEmoji,
    this.isVerified = false,
  });

  factory UserBasic.fromJson(Map<String, dynamic> json) {
    return UserBasic(
      id: json['id'] as int,
      username: json['username'] as String? ?? '',
      displayName: json['displayName'] as String? ?? '',
      avatarEmoji: json['avatarEmoji'] as String?,
      isVerified: json['isVerified'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'displayName': displayName,
      'avatarEmoji': avatarEmoji,
      'isVerified': isVerified,
    };
  }
}
