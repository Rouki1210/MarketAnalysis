/// Cryptocurrency asset model
class Asset {
  final int id;
  final String symbol;
  final String name;
  final String? description;
  final String? logoUrl;
  final int? rank;
  final DateTime? createdAt;

  Asset({
    required this.id,
    required this.symbol,
    required this.name,
    this.description,
    this.logoUrl,
    this.rank,
    this.createdAt,
  });

  factory Asset.fromJson(Map<String, dynamic> json) {
    return Asset(
      id: _parseInt(json['id'])!,
      symbol: (json['symbol'] as String).toUpperCase(),
      name: json['name'] as String,
      description: json['description'] as String?,
      logoUrl: json['logoUrl'] as String?,
      rank: _parseInt(json['rank']),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
    );
  }

  /// Safely parse int from dynamic value (handles String or int)
  static int? _parseInt(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is String) return int.tryParse(value);
    return null;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'symbol': symbol,
      'name': name,
      'description': description,
      'logoUrl': logoUrl,
      'rank': rank,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  Asset copyWith({
    int? id,
    String? symbol,
    String? name,
    String? description,
    String? logoUrl,
    int? rank,
    DateTime? createdAt,
  }) {
    return Asset(
      id: id ?? this.id,
      symbol: symbol ?? this.symbol,
      name: name ?? this.name,
      description: description ?? this.description,
      logoUrl: logoUrl ?? this.logoUrl,
      rank: rank ?? this.rank,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

/// Coin model with price and market data (combines Asset + PricePoint)
class Coin {
  final int id;
  final String symbol;
  final String name;
  final String? icon;
  final int? rank;
  final double price;
  final double change1h;
  final double change24h;
  final double change7d;
  final double marketCap;
  final double volume24h;
  final double? supply;
  final List<double>? sparklineData;
  final DateTime? createdAt;

  // UI helpers
  bool get isPositive1h => change1h >= 0;
  bool get isPositive24h => change24h >= 0;
  bool get isPositive7d => change7d >= 0;

  Coin({
    required this.id,
    required this.symbol,
    required this.name,
    this.icon,
    this.rank,
    required this.price,
    required this.change1h,
    required this.change24h,
    required this.change7d,
    required this.marketCap,
    required this.volume24h,
    this.supply,
    this.sparklineData,
    this.createdAt,
  });

  factory Coin.fromAssetAndPrice(Asset asset, PricePoint? price) {
    return Coin(
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      icon: asset.logoUrl,
      rank: asset.rank,
      price: price?.price ?? 0,
      change1h: price?.change1h ?? 0,
      change24h: price?.change24h ?? 0,
      change7d: price?.change7d ?? 0,
      marketCap: price?.marketCap ?? 0,
      volume24h: price?.volume24h ?? 0,
      supply: price?.circulatingSupply,
      sparklineData: null,
      createdAt: asset.createdAt,
    );
  }

  factory Coin.fromJson(Map<String, dynamic> json) {
    return Coin(
      id: _parseInt(json['id']) ?? 0,
      symbol: (json['symbol'] as String).toUpperCase(),
      name: json['name'] as String,
      icon: json['icon'] as String?,
      rank: _parseInt(json['rank']),
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      change1h: (json['change1h'] as num?)?.toDouble() ?? 0.0,
      change24h: (json['change24h'] as num?)?.toDouble() ?? 0.0,
      change7d: (json['change7d'] as num?)?.toDouble() ?? 0.0,
      marketCap: (json['marketCap'] as num?)?.toDouble() ?? 0.0,
      volume24h: (json['volume24h'] as num?)?.toDouble() ?? 0.0,
      supply: (json['supply'] as num?)?.toDouble(),
      sparklineData: (json['sparklineData'] as List<dynamic>?)
          ?.map((e) => (e as num).toDouble())
          .toList(),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
    );
  }

  /// Safely parse int from dynamic value (handles String or int)
  static int? _parseInt(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is String) return int.tryParse(value);
    return null;
  }

  Map<String, dynamic> toJson() {
    return {
      'symbol': symbol,
      'name': name,
      'icon': icon,
      'rank': rank,
      'price': price,
      'change1h': change1h,
      'change24h': change24h,
      'change7d': change7d,
      'marketCap': marketCap,
      'volume24h': volume24h,
      'supply': supply,
      'sparklineData': sparklineData,
    };
  }
}

/// Price point model
class PricePoint {
  final int id;
  final String assetSymbol;
  final double price;
  final double change1h;
  final double change24h;
  final double change7d;
  final double marketCap;
  final double volume24h;
  final double? circulatingSupply;
  final DateTime timestamp;

  PricePoint({
    required this.id,
    required this.assetSymbol,
    required this.price,
    required this.change1h,
    required this.change24h,
    required this.change7d,
    required this.marketCap,
    required this.volume24h,
    this.circulatingSupply,
    required this.timestamp,
  });

  factory PricePoint.fromJson(Map<String, dynamic> json) {
    return PricePoint(
      id: _parseInt(json['id'])!,
      assetSymbol:
          (json['symbol'] as String? ??
                  json['asset'] as String? ??
                  json['assetSymbol'] as String? ??
                  'UNKNOWN')
              .toUpperCase(),
      price: (json['price'] as num).toDouble(),
      change1h:
          (json['percentChange1h'] as num? ?? json['change1h'] as num?)
              ?.toDouble() ??
          0.0,
      change24h:
          (json['percentChange24h'] as num? ?? json['change24h'] as num?)
              ?.toDouble() ??
          0.0,
      change7d:
          (json['percentChange7d'] as num? ?? json['change7d'] as num?)
              ?.toDouble() ??
          0.0,
      marketCap: (json['marketCap'] as num?)?.toDouble() ?? 0.0,
      volume24h:
          (json['volume'] as num? ?? json['volume24h'] as num?)?.toDouble() ??
          0.0,
      circulatingSupply:
          (json['supply'] as num? ?? json['circulatingSupply'] as num?)
              ?.toDouble(),
      timestamp: DateTime.parse(
        json['timestampUtc'] as String? ??
            json['timestamp'] as String? ??
            DateTime.now().toIso8601String(),
      ),
    );
  }

  /// Safely parse int from dynamic value (handles String or int)
  static int? _parseInt(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is String) return int.tryParse(value);
    return null;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'assetSymbol': assetSymbol,
      'price': price,
      'change1h': change1h,
      'change24h': change24h,
      'change7d': change7d,
      'marketCap': marketCap,
      'volume24h': volume24h,
      'circulatingSupply': circulatingSupply,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
