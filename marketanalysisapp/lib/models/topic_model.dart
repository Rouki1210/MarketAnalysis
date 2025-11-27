class Topic {
  final int id;
  final String name;
  final String? description;
  final int postCount;
  final String? iconUrl;

  Topic({
    required this.id,
    required this.name,
    this.description,
    this.postCount = 0,
    this.iconUrl,
  });

  factory Topic.fromJson(Map<String, dynamic> json) {
    return Topic(
      id: json['id'] as int,
      name: json['name'] as String,
      description: json['description'] as String?,
      postCount: json['postCount'] as int? ?? 0,
      iconUrl: json['iconUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'postCount': postCount,
      'iconUrl': iconUrl,
    };
  }
}
