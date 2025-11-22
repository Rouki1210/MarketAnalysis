/// Watchlist model
class Watchlist {
  final int id;
  final int userId;
  final String name;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final List<WatchlistItem>? items;

  Watchlist({
    required this.id,
    required this.userId,
    required this.name,
    required this.createdAt,
    this.updatedAt,
    this.items,
  });

  factory Watchlist.fromJson(Map<String, dynamic> json) {
    final watchlistId = json['id'] is int
        ? json['id']
        : int.tryParse(json['id'].toString()) ?? 0;

    var itemsList = <WatchlistItem>[];

    // Handle 'items' (standard WatchlistItem)
    if (json['items'] != null && json['items'] is List) {
      itemsList = (json['items'] as List)
          .map((e) => WatchlistItem.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    // Handle 'assets' (List of Asset objects from backend)
    else if (json['assets'] != null && json['assets'] is List) {
      itemsList = (json['assets'] as List).map((e) {
        final assetMap = e as Map<String, dynamic>;
        return WatchlistItem(
          id: 0, // ID not available in this view
          watchlistId: watchlistId,
          assetSymbol: assetMap['symbol']?.toString() ?? 'UNKNOWN',
          addedAt: DateTime.now(), // Date not available in this view
        );
      }).toList();
    }

    return Watchlist(
      id: watchlistId,
      userId: json['userId'] is int
          ? json['userId']
          : int.tryParse(json['userId'].toString()) ?? 0,
      name: json['name']?.toString() ?? 'Unknown Watchlist',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString())
          : null,
      items: itemsList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'name': name,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'items': items?.map((e) => e.toJson()).toList(),
    };
  }
}

/// Watchlist item model
class WatchlistItem {
  final int id;
  final int watchlistId;
  final String assetSymbol;
  final DateTime addedAt;

  WatchlistItem({
    required this.id,
    required this.watchlistId,
    required this.assetSymbol,
    required this.addedAt,
  });

  factory WatchlistItem.fromJson(Map<String, dynamic> json) {
    return WatchlistItem(
      id: json['id'] is int
          ? json['id']
          : int.tryParse(json['id'].toString()) ?? 0,
      watchlistId: json['watchlistId'] is int
          ? json['watchlistId']
          : int.tryParse(json['watchlistId'].toString()) ?? 0,
      assetSymbol: (json['assetSymbol']?.toString() ?? 'UNKNOWN').toUpperCase(),
      addedAt: json['addedAt'] != null
          ? DateTime.tryParse(json['addedAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'watchlistId': watchlistId,
      'assetSymbol': assetSymbol,
      'addedAt': addedAt.toIso8601String(),
    };
  }
}
